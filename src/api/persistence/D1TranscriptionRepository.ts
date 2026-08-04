import type {
	Transcription,
	TranscriptionImage,
} from "@api/data/TranscriptionImage.ts";
import {
	decodeStoredImage,
	R2ImageRepository,
} from "@api/persistence/R2ImageRepository";
import * as schema from "@api/persistence/schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export type ImageSummary = {
	id: string;
	filename: string;
	languageCode: string;
	bookCode: string;
	chapter: number;
	verseStart: number;
	verseEnd: number;
	created: number | null;
	updated: number;
	transcription: string | null;
	hasTranscription: boolean;
};

export class D1TranscriptionRepository {
	private db: ReturnType<typeof drizzle>;
	private imageRepo: R2ImageRepository;

	constructor(d1: D1Database, imageRepo: R2ImageRepository) {
		this.db = drizzle(d1, { schema });
		this.imageRepo = imageRepo;
	}

	async upsertAndGetUserId(userId: string): Promise<number | null> {
		try {
			await this.db
				.insert(schema.transcriptionUsers)
				.values({ user: userId })
				.onConflictDoUpdate({
					target: schema.transcriptionUsers.user,
					set: { user: userId },
				});

			const userRecord = await this.db
				.select()
				.from(schema.transcriptionUsers)
				.where(eq(schema.transcriptionUsers.user, userId));

			if (userRecord && userRecord.length > 0) {
				return userRecord[0].id;
			}
			return null;
		} catch (error) {
			console.error("Error upserting/getting user ID:", error);
			return null;
		}
	}

	async createTranscriptionImage(image: TranscriptionImage): Promise<void> {
		const filePath = await this.imageRepo.storeImage(
			image.path,
			image.data,
		);

		const userId = await this.upsertAndGetUserId(image.userId);

		if (userId == null) {
			console.error(`User upsert failed, user id: ${image.userId}`);
			return;
		}

		await this.db
			.insert(schema.transcriptionImages)
			.values({
				id: image.id,
				userId: userId,
				userDeleted: image.user_deleted,
				filename: image.filename,
				created: image.created,
				filePath: filePath,
				languageCode: image.language_code,
				bookCode: image.book_code,
				chapter: image.chapter,
				verseStart: image.verse_start,
				verseEnd: image.verse_end,
				updated: Date.now(),
			})
			.onConflictDoUpdate({
				target: schema.transcriptionImages.id,
				set: {
					userDeleted: image.user_deleted,
					languageCode: image.language_code,
					bookCode: image.book_code,
					chapter: image.chapter,
					verseStart: image.verse_start,
					verseEnd: image.verse_end,
					updated: Date.now(),
				},
			});

		for (const transcription of image.transcription) {
			await this.upsertTranscription(image.id, transcription);
		}
	}

	/**
	 * Advances an image's sync watermark. Called by every mutation, including
	 * transcription writes, so a single cursor is enough for clients to catch up.
	 * The timestamp is always taken server-side - never from a client clock.
	 */
	private async touchImage(imageId: string): Promise<void> {
		await this.db
			.update(schema.transcriptionImages)
			.set({ updated: Date.now() })
			.where(eq(schema.transcriptionImages.id, imageId));
	}

	async upsertTranscription(
		imageId: string,
		transcription: Transcription,
	): Promise<void> {
		if (transcription.human_modified) {
			// Check if a human-modified transcription already exists for this image
			const existingHumanModified = await this.db
				.select()
				.from(schema.transcriptions)
				.where(
					and(
						eq(schema.transcriptions.imageId, imageId),
						eq(schema.transcriptions.humanModified, true),
					),
				);

			if (existingHumanModified && existingHumanModified.length > 0) {
				// Update the existing human-modified transcription
				await this.db
					.update(schema.transcriptions)
					.set({
						date: transcription.date,
						text: transcription.text,
					})
					.where(
						eq(
							schema.transcriptions.id,
							existingHumanModified[0].id,
						),
					);
			} else {
				// Insert a new human-modified transcription
				await this.db.insert(schema.transcriptions).values({
					imageId: imageId,
					humanModified: true,
					model: transcription.model,
					prompt: transcription.prompt,
					systemPrompt: transcription.system_prompt,
					date: transcription.date,
					text: transcription.text,
				});
			}
		} else {
			// Insert a new transcription if not human modified.
			await this.db.insert(schema.transcriptions).values({
				imageId: imageId,
				humanModified: false,
				model: transcription.model,
				prompt: transcription.prompt,
				systemPrompt: transcription.system_prompt,
				date: transcription.date,
				text: transcription.text,
			});
		}

		await this.touchImage(imageId);
	}

	async markImageAsUserDeleted(imageId: string): Promise<void> {
		await this.db
			.update(schema.transcriptionImages)
			.set({
				userDeleted: true,
				updated: Date.now(),
			})
			.where(eq(schema.transcriptionImages.id, imageId));
	}

	async updateTranscriptionText(
		imageId: string,
		transcriptionText: string,
	): Promise<void> {
		// Check if a human-modified transcription already exists for this image
		const existingHumanModified = await this.db
			.select()
			.from(schema.transcriptions)
			.where(
				and(
					eq(schema.transcriptions.imageId, imageId),
					eq(schema.transcriptions.humanModified, true),
				),
			);

		if (existingHumanModified && existingHumanModified.length > 0) {
			// Update the existing human-modified transcription
			await this.db
				.update(schema.transcriptions)
				.set({
					text: transcriptionText,
					date: Date.now(), // update the timestamp
				})
				.where(
					eq(schema.transcriptions.id, existingHumanModified[0].id),
				);
		} else {
			// Find the most recent non-human-modified transcription
			const recentNonModified = await this.db
				.select()
				.from(schema.transcriptions)
				.where(
					and(
						eq(schema.transcriptions.imageId, imageId),
						eq(schema.transcriptions.humanModified, false),
					),
				)
				.orderBy(desc(schema.transcriptions.date))
				.limit(1);

			if (recentNonModified && recentNonModified.length > 0) {
				// Create a human-modified copy
				await this.db.insert(schema.transcriptions).values({
					imageId: imageId,
					humanModified: true,
					model: recentNonModified[0].model,
					prompt: recentNonModified[0].prompt,
					systemPrompt: recentNonModified[0].systemPrompt,
					date: Date.now(),
					text: transcriptionText,
				});
			} else {
				console.warn(
					`No prior transcription for image ID: ${imageId} - storing human-modified text with empty provenance.`,
				);
				await this.db.insert(schema.transcriptions).values({
					imageId: imageId,
					humanModified: true,
					model: "",
					prompt: "",
					systemPrompt: "",
					date: Date.now(),
					text: transcriptionText,
				});
			}
		}

		await this.touchImage(imageId);
	}

	/** Resolves a WACS user id to the local TranscriptionUsers row id. */
	private async getDbUserId(wacsUserId: string): Promise<number | null> {
		const userRecord = await this.db
			.select()
			.from(schema.transcriptionUsers)
			.where(eq(schema.transcriptionUsers.user, wacsUserId));

		if (!userRecord || userRecord.length === 0) {
			return null;
		}
		return userRecord[0].id;
	}

	/**
	 * Every image a user currently has, oldest first.
	 * 
	 * Returns only metadata and the newest transcription text, if any. The full text of older
	 *
	async getImagesForUser(userId: string): Promise<ImageSummary[]> {
		const dbUserId = await this.getDbUserId(userId);
		if (dbUserId == null) {
			// Unknown user means nothing has ever been stored for them.
			return [];
		}

		const latestDates = this.db
			.select({
				imageId: schema.transcriptions.imageId,
				maxDate: sql`MAX(${schema.transcriptions.date})`.as("maxDate"),
			})
			.from(schema.transcriptions)
			.groupBy(schema.transcriptions.imageId)
			.as("latest_transcriptions");

		const rows = await this.db
			.select({
				id: schema.transcriptionImages.id,
				filename: schema.transcriptionImages.filename,
				languageCode: schema.transcriptionImages.languageCode,
				bookCode: schema.transcriptionImages.bookCode,
				chapter: schema.transcriptionImages.chapter,
				verseStart: schema.transcriptionImages.verseStart,
				verseEnd: schema.transcriptionImages.verseEnd,
				created: schema.transcriptionImages.created,
				updated: schema.transcriptionImages.updated,
				transcription: schema.transcriptions.text,
			})
			.from(schema.transcriptionImages)
			.where(
				and(
					eq(schema.transcriptionImages.userId, dbUserId),
					eq(schema.transcriptionImages.userDeleted, false),
				),
			)
			.leftJoin(
				latestDates,
				eq(latestDates.imageId, schema.transcriptionImages.id),
			)
			.leftJoin(
				schema.transcriptions,
				and(
					eq(
						schema.transcriptions.imageId,
						schema.transcriptionImages.id,
					),
					eq(
						schema.transcriptions.date,
						sql`latest_transcriptions.maxDate`,
					),
				),
			)
			.orderBy(asc(schema.transcriptionImages.created));

		// Two transcriptions sharing an image's newest date would duplicate its
		// row. Vanishingly unlikely, but a duplicate image in the list would be
		// visible, so collapse on id.
		const seen = new Set<string>();
		const images: ImageSummary[] = [];
		for (const row of rows) {
			if (seen.has(row.id)) {
				continue;
			}
			seen.add(row.id);
			images.push({
				...row,
				hasTranscription: row.transcription != null,
			});
		}
		return images;
	}

	/**
	 * Looks up one image, but only if it belongs to the given user and has not
	 * been deleted. Returns null for a missing, foreign, or deleted image alike,
	 * so the response cannot be used to probe for other users' image ids, and
	 * content stays unreachable once the list stops reporting it.
	 */
	private async getOwnedImage(
		userId: string,
		imageId: string,
	): Promise<{ filePath: string; filename: string } | null> {
		const dbUserId = await this.getDbUserId(userId);
		if (dbUserId == null) {
			return null;
		}

		const rows = await this.db
			.select({
				filePath: schema.transcriptionImages.filePath,
				filename: schema.transcriptionImages.filename,
			})
			.from(schema.transcriptionImages)
			.where(
				and(
					eq(schema.transcriptionImages.id, imageId),
					eq(schema.transcriptionImages.userId, dbUserId),
					eq(schema.transcriptionImages.userDeleted, false),
				),
			)
			.limit(1);

		return rows.at(0) ?? null;
	}

	/**
	 * An image's bytes, ready to serve, or null if the caller may not have them.
	 *
	 * Combines the ownership check, the R2 read, and the decode from the stored
	 * base64 form, so callers need to know none of those things - in particular not
	 * that R2 holds a data URL as text/plain rather than raw bytes.
	 *
	 * Returns null indistinguishably for a missing, foreign, deleted, or
	 * unreadable image; the route turns all of them into the same 404.
	 */
	async getImageBytes(
		userId: string,
		imageId: string,
	): Promise<{ bytes: Uint8Array; contentType: string } | null> {
		const owned = await this.getOwnedImage(userId, imageId);
		if (!owned) {
			return null;
		}

		const stored = await this.imageRepo.retrieveImage(owned.filePath);
		if (!stored) {
			console.error(
				`Image row ${imageId} points at missing R2 object ${owned.filePath}`,
			);
			return null;
		}

		return decodeStoredImage(stored);
	}
}

/**
 * Builds a repository from the Worker's bindings.
 */
export function createRepo(env: Env): D1TranscriptionRepository {
	return new D1TranscriptionRepository(
		env.HTR_DATABASE,
		new R2ImageRepository(env.HTR_STORAGE),
	);
}
