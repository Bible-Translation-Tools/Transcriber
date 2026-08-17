import { requireCurrentUserId } from "@src/domain/CurrentUser.ts";
import { refreshProgress, uploadNewImage } from "@src/domain/ImageActions.ts";
import { processFiles } from "@src/domain/ProcessFiles.tsx";
import { useTranscriptionStore } from "@src/persistence/store/TranscriptionStore.ts";
import syncEngine from "@src/services/SyncEngine.ts";
import { toast } from "react-toastify";

export function useUploadImage() {
	const store = useTranscriptionStore();

	/**
	 * Uploads each picked file, then refreshes from the server so the list and the
	 * new transcription text come from one authoritative place.
	 *
	 * Files are uploaded one at a time so a failure part-way through reports which
	 * ones did not make it, rather than failing the batch opaquely.
	 */
	async function uploadImage(files: File[]): Promise<void> {
		const userId = requireCurrentUserId();
		const incoming = await processFiles(files);
		const failed: string[] = [];

		for (const image of incoming) {
			try {
				await uploadNewImage(store, userId, image);
			} catch (error) {
				console.error(`Upload failed for ${image.filename}`, error);
				failed.push(image.filename ?? "untitled");
			}
		}

		if (failed.length > 0) {
			toast.error(`Could not upload: ${failed.join(", ")}`);
		}

		// Best-effort: the uploads above already resolved each image's final
		// status, so a failure here degrades to slightly stale counts rather
		// than a stuck spinner.
		try {
			await syncEngine.sync(userId);
			await store.refreshProject();
			await refreshProgress(store, userId);
		} catch (error) {
			console.error("Refresh after upload failed", error);
			toast.error(
				"Uploaded, but could not refresh from the server. Reload to see the latest state.",
			);
		}
	}

	return uploadImage;
}
