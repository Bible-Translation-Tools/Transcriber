import {
	API_V1,
	IMAGE_ROUTE,
	IMAGES_ROUTE,
	UPDATE_TRANSCRIPTION_ROUTE,
} from "@src/constants";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { TranscriptionStatus } from "@src/data/TranscriptionStatus";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository";

/** One image as the server reports it. Mirrors the /images response element. */
type ImageSummary = {
	id: string;
	filename: string;
	languageCode: string;
	bookCode: string;
	chapter: number;
	verseStart: number;
	verseEnd: number;
	created: number | null;
	transcription: string | null;
	hasTranscription: boolean;
};

export type SyncResult = {
	/** Images in the server's list after this run. */
	images: number;
	/** Queued text edits accepted by the server. */
	pushed: number;
};

const repo = IndexedDBImageRepository.getInstance();

/**
 * Keeps the local cache in step with the server.
 *
 * The server is the only source of truth. The client does not merge - it replaces
 * its image list with whatever /images returns, so the two cannot diverge and a
 * delete propagates by simple absence.
 *
 * Transcription text arrives with the list, so selecting a page costs no request
 * and text stays readable offline. It is replaced wholesale each time rather than
 * merged, which is what keeps it from going stale.
 *
 * Two things are cached locally, both with trivial invariants:
 *
 * - image bytes, keyed by id, fetched at most once per browser. An image's bytes
 *   never change, so "present or absent" is the whole of the cache logic.
 * - unsent transcription edits, the one case where local state is genuinely newer
 *   than the server's and must survive a refresh.
 */
class SyncEngine {
	private inFlight: Promise<SyncResult> | null = null;
	private flushInFlight: Promise<number> | null = null;

	/**
	 * Push queued edits, then replace the local list with the server's.
	 * Concurrent calls share one run, so a mount and a Refresh click cannot
	 * double-fetch.
	 */
	sync(userId: string): Promise<SyncResult> {
		if (this.inFlight) {
			return this.inFlight;
		}
		this.inFlight = this.run(userId).finally(() => {
			this.inFlight = null;
		});
		return this.inFlight;
	}

	/**
	 * Pushes queued text edits without re-fetching the image list.
	 *
	 * The light path for debounced typing: a full sync per keystroke burst
	 * would re-fetch /images and rewrite IndexedDB every ~500ms for no new
	 * information - the server's copy of the text is the one we just sent.
	 * Concurrent calls share one run, like sync().
	 */
	flushOutbox(userId: string): Promise<number> {
		if (typeof navigator !== "undefined" && navigator.onLine === false) {
			// Offline: queued edits are already durable; the next sync or
			// flush will deliver them.
			return Promise.resolve(0);
		}
		if (this.flushInFlight) {
			return this.flushInFlight;
		}
		this.flushInFlight = this.flushTextEdits(userId).finally(() => {
			this.flushInFlight = null;
		});
		return this.flushInFlight;
	}

	private async run(userId: string): Promise<SyncResult> {
		if (typeof navigator !== "undefined" && navigator.onLine === false) {
			// Offline: queued edits are already durable, so there is nothing to
			// lose by waiting for the next trigger.
			return { images: 0, pushed: 0 };
		}
		// Push first, so the list we fetch afterwards already reflects our edits.
		const pushed = await this.flushTextEdits(userId);

		const response = await fetch(`${API_V1}${IMAGES_ROUTE}`);
		if (!response.ok) {
			throw new Error(
				`Could not fetch image list: ${response.status} ${response.statusText}`,
			);
		}
		const { images } = (await response.json()) as {
			images: ImageSummary[];
		};

		await repo.replaceImages(userId, images.map(toDocument));
		return { images: images.length, pushed };
	}

	/**
	 * Sends unsent transcription edits and clears each one the server accepts.
	 *
	 * The cached text is removed on acknowledgement and at no other time. A failure
	 * keeps it - one image failing does not hold up the others, since the entries
	 * are one-per-image and independent of each other.
	 */
	private async flushTextEdits(userId: string): Promise<number> {
		const entries = await repo.listUnsentText(userId);
		let pushed = 0;

		for (const entry of entries) {
			try {
				const response = await fetch(
					`${API_V1}${UPDATE_TRANSCRIPTION_ROUTE}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							imageId: entry.imageId,
							transcription: entry.text,
						}),
					},
				);
				if (!response.ok) {
					throw new Error(
						`${response.status} ${response.statusText}`,
					);
				}
				// This endpoint reports failures in the body, not the status.
				const body = (await response.json().catch(() => ({}))) as {
					error?: string;
				};
				if (body?.error) {
					throw new Error(body.error);
				}

				// Saved on the server - only now is the local copy redundant.
				await repo.clearUnsentText(entry.imageId);
				pushed++;
			} catch (error) {
				// Keep the text and carry on. Never discard a draft because the
				// network or the server is misbehaving.
				console.error(
					`Could not save transcription for ${entry.imageId}; keeping it locally`,
					error,
				);
				await repo.recordFailedAttempt(entry);
			}
		}

		return pushed;
	}

	/**
	 * An object URL for an image's bytes, served from the local cache when
	 * present and fetched exactly once when not.
	 *
	 * Callers own the returned URL and must revokeObjectURL it when done.
	 */
	async getBlobUrl(userId: string, imageId: string): Promise<string | null> {
		const cached = await repo.getBlob(userId, imageId);
		if (cached) {
			return URL.createObjectURL(cached);
		}

		const response = await fetch(`${API_V1}${IMAGE_ROUTE}/${imageId}`);
		if (!response.ok) {
			console.error(
				`Could not fetch image ${imageId}: ${response.status} ${response.statusText}`,
			);
			return null;
		}

		const blob = await response.blob();
		await repo.putBlob(userId, imageId, blob);
		return URL.createObjectURL(blob);
	}
}

/**
 * Maps a server summary onto the shape the UI works with.
 *
 * An image the server holds without text is NOT_TRANSCRIBED, not an error -
 * nothing failed, the work simply has not been done.
 */
function toDocument(summary: ImageSummary): TranscribableDocument {
	return {
		id: summary.id,
		filename: summary.filename,
		created: summary.created ?? 0,
		hasTranscription: summary.hasTranscription,
		transcription: summary.transcription,
		languageCode: summary.languageCode,
		bookCode: summary.bookCode,
		chapter: summary.chapter,
		startVerse: summary.verseStart,
		endVerse: summary.verseEnd,
		status: summary.hasTranscription
			? TranscriptionStatus.COMPLETED
			: TranscriptionStatus.NOT_TRANSCRIBED,
	};
}

const syncEngine = new SyncEngine();
export default syncEngine;
