import type { R2ImageRepository } from "@api/persistence/R2ImageRepository";
import * as schema from "@api/persistence/schema";
import type {
	Transcription,
	TranscriptionImage,
} from "@api/data/TranscriptionImage.ts";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

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
				userDeleted: image.user_deleted ? 1 : 0,
				filePath,
				languageCode: image.language_code,
				bookCode: image.book_code,
				chapter: image.chapter,
				verseStart: image.verse_start,
				verseEnd: image.verse_end,
			})
			.onConflictDoUpdate({
				target: schema.transcriptionImages.id,
				set: {
					userDeleted: image.user_deleted ? 1 : 0,
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
						eq(schema.transcriptions.humanModified, 1),
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
					humanModified: 1,
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
				humanModified: 0,
				model: transcription.model,
				prompt: transcription.prompt,
				systemPrompt: transcription.system_prompt,
				date: transcription.date,
				text: transcription.text,
			});
		}
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
					eq(schema.transcriptions.humanModified, 1),
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
						eq(schema.transcriptions.humanModified, 0),
					),
				)
				.orderBy(desc(schema.transcriptions.date))
				.limit(1);

			if (recentNonModified && recentNonModified.length > 0) {
				// Create a human-modified copy
				await this.db.insert(schema.transcriptions).values({
					imageId: imageId,
					humanModified: 1,
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
}
