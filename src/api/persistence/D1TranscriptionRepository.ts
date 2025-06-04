import type {
	Transcription,
	TranscriptionImage,
} from "@api/data/TranscriptionImage.ts";
import type { R2ImageRepository } from "@api/persistence/R2ImageRepository";
import * as schema from "@api/persistence/schema";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export type UserImageRecord = {
	[imgIg: string]: TranscribableDocument;
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
				},
			});

		for (const transcription of image.transcription) {
			await this.upsertTranscription(image.id, transcription);
		}
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
	}

	async markImageAsUserDeleted(imageId: string): Promise<void> {
		await this.db
			.update(schema.transcriptionImages)
			.set({
				userDeleted: true,
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
					`No non-human-modified transcriptions found for image ID: ${imageId}`,
				);
			}
		}
	}
	async getAllImagesForUser({
		userId,
		indexedDbImgIds,
	}: {
		userId: string;
		indexedDbImgIds: string[];
	}): Promise<UserImageRecord> {
		// userId is from wacs
		// Need to get transcriptionUsers.id from sqlite; query transcriptionUsers where user like userId given;
		const userRecord = await this.db
			.select()
			.from(schema.transcriptionUsers)
			.where(eq(schema.transcriptionUsers.user, userId));
		console.log({ userRecord });

		if (!userRecord || userRecord.length === 0) {
			return {} as TranscribableDocument;
		}

		const dbUserId = userRecord[0].id;
		// subquery to get only the most max unix epoch date
		const latestTranscriptions = this.db
			.select({
				imageId: schema.transcriptions.imageId,
				maxDate: sql`MAX(${schema.transcriptions.date})`.as("maxDate"),
				date: schema.transcriptions.date,
			})
			.from(schema.transcriptions)
			.groupBy(schema.transcriptions.imageId)
			.as("latest_transcriptions");
		// Given that id, query transcriptionImages where userId = id,
		//join transcriptions table on imagId, but only take the most recent date
		const images = await this.db
			.select({
				id: schema.transcriptionImages.id,
				userId: schema.transcriptionImages.userId,
				userDeleted: schema.transcriptionImages.userDeleted,
				filePath: schema.transcriptionImages.filePath,
				fileName: schema.transcriptionImages.filename,
				languageCode: schema.transcriptionImages.languageCode,
				bookCode: schema.transcriptionImages.bookCode,
				chapter: schema.transcriptionImages.chapter,
				verseStart: schema.transcriptionImages.verseStart,
				verseEnd: schema.transcriptionImages.verseEnd,
				transcription: schema.transcriptions.text,
				created: schema.transcriptionImages.created,
			})
			.from(schema.transcriptionImages)
			.where(
				and(
					eq(schema.transcriptionImages.userId, dbUserId),
					eq(schema.transcriptionImages.userDeleted, false),
				),
			)
			// Use latestTranscriptions to filter down to only the latest date.
			.leftJoin(
				latestTranscriptions,
				eq(latestTranscriptions.imageId, schema.transcriptionImages.id),
			)
			// Then join back to transcriptions to get the full row that matches both imageId and maxDate.
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
			);
		// Now for any id on server that is not in indexedDbImgIds, we need to also fetch the data from r2 bucket;
		const withMissingImgData = await Promise.all(
			images.map(async (image) => {
				// todo: upudate schmea to not accept nullable values for some of these
				const updated: TranscribableDocument = {
					...image,
					data: null,
					filename: image.fileName,
				};
				if (indexedDbImgIds.includes(image.id) || !image.filePath) {
					return updated;
				}
				const imgData = await this.imageRepo.retrieveImage(
					image.filePath,
				);
				if (!imgData) {
					return updated;
				}
				const u8 = new Uint8Array(imgData);
				const decoder = new TextDecoder("utf-8");
				updated.data = decoder.decode(u8);
				return updated;
			}),
		);

		// return as a record to make easier for client to update their own objects by doing a if localImgs[localId] => updated / else create
		const asRecord = withMissingImgData.reduce(
			(record: UserImageRecord, img: TranscribableDocument) => {
				if (img.id) {
					record[img.id] = img;
				}
				return record;
			},
			{},
		);
		return asRecord;
	}
}
