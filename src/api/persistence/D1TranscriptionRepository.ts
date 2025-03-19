import { R2ImageRepository } from "@api/persistence/R2ImageRepository";
import {TranscriptionImage} from "@src/data/TranscriptionImage"
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@api/persistence/schema';

export class D1TranscriptionRepository {
    private db: ReturnType<typeof drizzle>;
    private imageRepo: R2ImageRepository;

    constructor(d1: D1Database, imageRepo: R2ImageRepository) {
        this.db = drizzle(d1, { schema });
        this.imageRepo = imageRepo;
    }

    async createTranscriptionImage(image: TranscriptionImage): Promise<void> {
        const filePath = await this.imageRepo.storeImage(image.path, image.data);

        await this.db.insert(schema.transcriptionImages).values({
            id: image.id,
            filePath,
            languageCode: image.language_code,
            bookCode: image.book_code,
            chapter: image.chapter,
            verseStart: image.verse_start,
            verseEnd: image.verse_end,
        });

        for (const transcription of image.transcription) {
            const transcriptionResult = await this.db.insert(schema.transcriptions).values({
                imageId: image.id,
                humanModified: transcription.human_modified ? 1 : 0,
                model: transcription.model,
                prompt: transcription.prompt,
                systemPrompt: transcription.system_prompt,
                date: transcription.date,
            }).returning({ insertedId: schema.transcriptions.id });

            const transcriptionId = transcriptionResult[0].insertedId;

            for (const text of transcription.text) {
                await this.db.insert(schema.transcriptionTexts).values({
                    transcriptionId: transcriptionId,
                    startVerse: text.start_verse,
                    endVerse: text.end_verse,
                    text: text.text,
                });
            }
        }
    }
}