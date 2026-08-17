import type { TranscriptionRequest } from "@api/domain/TranscriptionRequest.ts";
import {
	API_V1,
	DELETE_TRANSCRIPTION_ROUTE,
	TRANSCRIBE_ROUTE,
} from "@src/constants";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { TranscriptionStatus } from "@src/data/TranscriptionStatus.ts";
import { calculateProgress } from "@src/domain/CalculateProgress.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import {
	type TranscriptionStore,
	useTranscriptionStore,
} from "@src/persistence/store/TranscriptionStore.ts";
import { toast } from "react-toastify";

const imageRepo = IndexedDBImageRepository.getInstance();

/**
 * A newly picked file, before it has an id or a home. `data` carries the base64
 * data URL needed for the transcription request; `blob` carries the same bytes in
 * the form we actually cache.
 */
export type IncomingImage = Partial<TranscribableDocument> & {
	blob?: Blob;
};

/**
 * Uploads a freshly picked image and caches its bytes locally.
 *
 * Sent immediately rather than queued: transcription happens server-side, so a
 * queued upload could never produce text anyway - it would only defer the work
 * while adding a replay path to get wrong.
 *
 * The bytes are cached before the request so the image can be displayed straight
 * away, and never need downloading again even though the request may take a while.
 */
export const uploadNewImage = async (
	store: TranscriptionStore,
	userId: string,
	incoming: IncomingImage,
): Promise<void> => {
	if (store.language == null) {
		throw new Error("Language is null, cannot add image!");
	}

	const document: TranscribableDocument = {
		id: self.crypto.randomUUID(),
		filename: incoming.filename ?? "untitled",
		created: incoming.created ?? Date.now(),
		transcription: null,
		hasTranscription: false,
		languageCode: store.language.code,
		bookCode: store.bookCode,
		chapter: store.chapter,
		status: TranscriptionStatus.IN_PROGRESS,
	};

	if (incoming.blob) {
		await imageRepo.putBlob(userId, document.id, incoming.blob);
	}
	// Metadata persisted alongside the bytes, so a refresh before the upload
	// settles still lists the page instead of silently dropping it.
	await imageRepo.putImage(userId, document);

	// Optimistic, so the panel shows the page immediately with a spinner.
	store.setImages((previous) => [...previous, document]);
	store.setSelectedImage(document);

	try {
		const response = await fetch(`${API_V1}${TRANSCRIBE_ROUTE}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(
				buildTranscriptionRequest(store, document, incoming.data),
			),
		});
		const body = (await response.json().catch(() => ({}))) as {
			error?: string;
			transcription?: string;
		};
		if (!response.ok || body?.error) {
			throw new Error(
				body?.error ?? `${response.status} ${response.statusText}`,
			);
		}

		// The server transcribes synchronously and returns the text, so the
		// document's final state is known right here rather than deferred to a
		// follow-up sync that might fail and leave the spinner stuck.
		if (typeof body.transcription === "string") {
			await updateImage(store, userId, {
				...document,
				transcription: body.transcription,
				hasTranscription: true,
				status: TranscriptionStatus.COMPLETED,
			});
		}
	} catch (error) {
		// Roll back the optimistic entry - cached bytes, metadata, list,
		// selection - so a failed upload cannot leave a phantom page that
		// spins forever.
		await imageRepo.deleteImage(userId, document.id);
		store.setImages((previous) =>
			previous.filter((image) => image.id !== document.id),
		);
		if (
			useTranscriptionStore.getState().selectedImage?.id === document.id
		) {
			store.setSelectedImage(null);
		}
		throw error;
	}
};

const buildTranscriptionRequest = (
	store: TranscriptionStore,
	document: TranscribableDocument,
	data: unknown,
): TranscriptionRequest => ({
	image: String(data ?? ""),
	imageId: document.id,
	created: document.created,
	bookCode: document.bookCode,
	languageCode: document.languageCode,
	filename: document.filename,
	chapter: document.chapter,
	model: store.model,
	systemPrompt: store.systemPrompt,
	prompt: store.prompt,
});

/** Writes a document to the cache and reflects it in the in-memory store. */
export const updateImage = async (
	store: TranscriptionStore,
	userId: string,
	updatedImage: TranscribableDocument,
): Promise<void> => {
	await imageRepo.putImage(userId, updatedImage);

	store.setImages((previous) =>
		previous.map((image) =>
			image.id === updatedImage.id ? updatedImage : image,
		),
	);
	// Read the selection fresh: the `store` argument is a render-time snapshot,
	// and the selection may have changed while an await above was in flight.
	if (
		useTranscriptionStore.getState().selectedImage?.id === updatedImage.id
	) {
		store.setSelectedImage(updatedImage);
	}
};

/**
 * Records edited transcription text locally, then lets the sync engine deliver it.
 *
 * The one thing that is held locally rather than sent straight away. The user may
 * be mid-sentence with no connection, so the text goes to IndexedDB first and
 * survives a refresh; it is cleared only once the server has accepted it.
 */
export const saveTranscriptionText = async (
	store: TranscriptionStore,
	userId: string,
	document: TranscribableDocument,
	text: string,
): Promise<void> => {
	// The offline copy. Written before anything else can fail.
	await imageRepo.saveUnsentText(userId, document.id, text);

	await updateImage(store, userId, {
		...document,
		transcription: text,
		hasTranscription: true,
		status: TranscriptionStatus.COMPLETED,
	});
};

/** Re-runs transcription for an image whose bytes are already cached. */
export const retranscribe = async (
	store: TranscriptionStore,
	userId: string,
	document: TranscribableDocument,
): Promise<void> => {
	const blob = await imageRepo.getBlob(userId, document.id);
	if (!blob) {
		toast.error(
			"Image data is not available locally - cannot retranscribe.",
		);
		return;
	}

	await updateImage(store, userId, {
		...document,
		status: TranscriptionStatus.IN_PROGRESS,
	});

	try {
		const response = await fetch(`${API_V1}${TRANSCRIBE_ROUTE}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(
				buildTranscriptionRequest(
					store,
					document,
					await blobToDataUrl(blob),
				),
			),
		});
		const body = (await response.json().catch(() => ({}))) as {
			error?: string;
			transcription?: string;
		};
		if (!response.ok || body?.error) {
			throw new Error(
				body?.error ?? `${response.status} ${response.statusText}`,
			);
		}

		// The response carries the finished text, so the
		// document leaves IN_PROGRESS here rather than waiting on a sync.
		if (typeof body.transcription === "string") {
			await updateImage(store, userId, {
				...document,
				transcription: body.transcription,
				hasTranscription: true,
				status: TranscriptionStatus.COMPLETED,
			});
		}
	} catch (error) {
		// Leave the processing state, or the overlay spins forever with no
		// way to retry.
		await updateImage(store, userId, {
			...document,
			status: TranscriptionStatus.TRANSCRIPTION_ERROR,
		});
		throw error;
	}
};

/**
 * Deletes an image on the server, then locally.
 *
 * Server first, deliberately. The old version removed the local copy before the
 * request and left the two disagreeing whenever the request failed; now a failure
 * throws and the image stays visible, which is the honest outcome.
 */
export const deleteImage = async (
	store: TranscriptionStore,
	userId: string,
	document: TranscribableDocument,
): Promise<void> => {
	const response = await fetch(`${API_V1}${DELETE_TRANSCRIPTION_ROUTE}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ imageId: document.id }),
	});
	const body = (await response.json().catch(() => ({}))) as {
		error?: string;
	};
	if (!response.ok || body?.error) {
		throw new Error(
			body?.error ?? `${response.status} ${response.statusText}`,
		);
	}

	await imageRepo.deleteImage(userId, document.id);

	store.setImages((previous) =>
		previous.filter((image) => image.id !== document.id),
	);
	if (store.selectedImage?.id === document.id) {
		store.setSelectedImage(null);
	}
	await refreshProgress(store, userId);
};

/** Recomputes the per-book progress counts from everything cached locally. */
export const refreshProgress = async (
	store: TranscriptionStore,
	userId: string,
): Promise<void> => {
	const all = await imageRepo.getAllForUser(userId);
	store.setProgress(calculateProgress(all));
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
