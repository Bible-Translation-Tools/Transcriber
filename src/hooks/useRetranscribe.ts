import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { requireCurrentUserId } from "@src/domain/CurrentUser.ts";
import { retranscribe } from "@src/domain/ImageActions.ts";
import { useTranscriptionStore } from "@src/persistence/store/TranscriptionStore.ts";
import syncEngine from "@src/services/SyncEngine.ts";
import { toast } from "react-toastify";

export function useRetranscribe() {
	async function retranscribeDocument(
		document: TranscribableDocument,
	): Promise<void> {
		const userId = requireCurrentUserId();
		// Read the store through getState() rather than the hook: "Transcribe
		// Again" can fire from a toast, whose closure may hold stale settings.
		const store = useTranscriptionStore.getState();

		try {
			await retranscribe(store, userId, document);
		} catch (error) {
			console.error("Retranscribe failed", error);
			toast.error("Could not retranscribe the image. Please try again.");
			return;
		}

		try {
			await syncEngine.sync(userId);
			await store.refreshProject();
		} catch (error) {
			console.error("Refresh after retranscribe failed", error);
		}
	}

	return retranscribeDocument;
}
