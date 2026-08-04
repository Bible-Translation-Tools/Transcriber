import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { requireCurrentUserId } from "@src/domain/CurrentUser.ts";
import { deleteImage } from "@src/domain/ImageActions.ts";
import { useTranscriptionStore } from "@src/persistence/store/TranscriptionStore.ts";
import { toast } from "react-toastify";

export function useDeleteImage() {
	const store = useTranscriptionStore();

	/**
	 * Deletes server-side first, so a failure leaves the image visible and the
	 * user informed rather than vanished locally and still present everywhere else.
	 */
	async function deleteTranscription(
		document: TranscribableDocument,
	): Promise<void> {
		const userId = requireCurrentUserId();
		try {
			await deleteImage(store, userId, document);
		} catch (error) {
			console.error("Delete failed", error);
			toast.error("Could not delete the image. Please try again.");
		}
	}

	return deleteTranscription;
}
