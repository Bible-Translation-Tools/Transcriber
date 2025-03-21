import type { TranscriptionImage } from "../data/TranscriptionImage";
import type IndexedDBImageRepository from "./IndexedDbImageRepository";

class TranscriptionRepository {
	constructor(
		private db: any,
		private imageRepo: IndexedDBImageRepository,
	) {}

	async createTranscriptionImage(image: TranscriptionImage): Promise<void> {
		const filePath = await this.imageRepo.storeImage(
			image.id,
			this.base64ToArrayBuffer(image.data),
		);

		await this.db.run(
			"INSERT INTO TranscriptionImages (id, file_path, language_code, book_code, chapter, verse_start, verse_end) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[
				image.id,
				filePath, // imageId is stored as file_path
				image.language_code,
				image.book_code,
				image.chapter,
				image.verse_start,
				image.verse_end,
			],
		);

		// ... (rest of the logic to insert Transcriptions and TranscriptionTexts)
	}

	async retrieveImage(imageId: string): Promise<ArrayBuffer | null> {
		return this.imageRepo.retrieveImage(imageId);
	}

	// ... (other methods for database operations)

	private base64ToArrayBuffer(base64: string): ArrayBuffer {
		const binary_string = atob(base64);
		const len = binary_string.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}
}
