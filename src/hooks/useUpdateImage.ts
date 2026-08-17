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

		// Outbox-only flush, not a full sync: a debounced edit fires every
		// ~500ms of typing, and re-fetching /images plus rewriting IndexedDB
		// on each one is churn that can also hand the editor a stale snapshot.
		try {
			await syncEngine.flushOutbox(userId);
			await refreshProgress(store, userId);
		} catch (error) {
			console.error("Flush after edit failed", error);
		}
	}

	return updateTranscription;
}
