import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { requireCurrentUserId } from "@src/domain/CurrentUser.ts";
import {
	refreshProgress,
	saveTranscriptionText,
} from "@src/domain/ImageActions.ts";
import { useTranscriptionStore } from "@src/persistence/store/TranscriptionStore.ts";
import syncEngine from "@src/services/SyncEngine.ts";

export function useUpdateImage() {
	const store = useTranscriptionStore();

	/**
	 * Saves edited transcription text: locally first, then to the server. The
	 * local copy is what makes the edit survive a refresh or an offline spell, and
	 * it is discarded only once the server has it.
	 */
	async function updateTranscription(
		document: TranscribableDocument,
	): Promise<void> {
		const userId = requireCurrentUserId();
		await saveTranscriptionText(
			store,
			userId,
			document,
			document.transcription ?? "",
		);

		try {
			await syncEngine.sync(userId);
			await refreshProgress(store, userId);
		} catch (error) {
			console.error("Sync after edit failed", error);
		}
	}

	return updateTranscription;
}
