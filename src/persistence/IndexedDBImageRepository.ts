import type { TranscribableDocument } from "@src/data/TranscribableDocument";

const DB_NAME = "imageDB";
/**
 * v4 adds the blob, meta, and outbox stores and strips image bytes off the
 * metadata records. v3 - one `images` store holding base64 data URLs - is the
 * version this upgrades from.
 */
const DB_VERSION = 4;

const IMAGE_STORE = "images";
const BLOB_STORE = "blobs";
const META_STORE = "meta";
/**
 * The offline text cache: transcription edits the server has not accepted yet,
 * one row per image, keyed by image id.
 *
 * This is the ONLY place transcription text is stored locally. An entry exists
 * precisely while the user's text is not yet safe on the server, and is removed
 * the moment the server accepts it - so a stale copy cannot outlive the edit it
 * belongs to.
 */
const OUTBOX_STORE = "outbox";

const BY_USER_INDEX = "by_user";
const BY_USER_PROJECT_INDEX = "by_user_project";

const MIGRATED_V4_KEY = "migratedV4";

/**
 * The only fields we persist. Anything else on an in-memory document - a
 * transient `loading` flag, server-shaped leftovers like `filePath` or
 * `fileName` - is dropped on the way in, so the store cannot silently
 * accumulate junk the way it used to.
 */
type StoredImage = {
	id: string;
	userId: string;
	filename: string;
	created: number;
	hasTranscription: boolean;
	transcription: string | null;
	status: string;
	languageCode: string;
	bookCode: string;
	chapter: number;
	startVerse?: number;
	endVerse?: number;
};

/**
 * One image's unsent transcription text. Keyed by imageId, so a later edit to the
 * same image replaces the earlier one instead of queuing behind it.
 */
export type OutboxEntry = {
	imageId: string;
	userId: string;
	text: string;
	attempts: number;
	updatedAt: number;
};

/** Promisifies a single IDBRequest. */
function promisify<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

/** Resolves once a transaction has actually committed. */
function transactionDone(tx: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});
}

function toStored(userId: string, doc: TranscribableDocument): StoredImage {
	return {
		id: doc.id,
		userId,
		filename: doc.filename,
		created: Number(doc.created ?? 0),
		hasTranscription: Boolean(doc.hasTranscription),
		transcription: doc.transcription ?? null,
		status: String(doc.status),
		languageCode: doc.languageCode,
		bookCode: doc.bookCode,
		chapter: Number(doc.chapter),
		...(doc.startVerse != null
			? { startVerse: Number(doc.startVerse) }
			: {}),
		...(doc.endVerse != null ? { endVerse: Number(doc.endVerse) } : {}),
	};
}

class IndexedDBImageRepository {
	private static instance: IndexedDBImageRepository =
		new IndexedDBImageRepository();

	private dbPromise: Promise<IDBDatabase>;
	private recentLanguages = new Set<string>();
	private migration: Promise<void> | null = null;

	constructor() {
		this.dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				const tx = (event.target as IDBOpenDBRequest).transaction;
				if (!tx) {
					return;
				}

				const images = db.objectStoreNames.contains(IMAGE_STORE)
					? tx.objectStore(IMAGE_STORE)
					: db.createObjectStore(IMAGE_STORE, { keyPath: "id" });

				if (!images.indexNames.contains(BY_USER_INDEX)) {
					images.createIndex(BY_USER_INDEX, "userId");
				}
				// Kept for project navigation: turns the language/book/chapter
				// lookup into an index range instead of scanning every record.
				if (!images.indexNames.contains(BY_USER_PROJECT_INDEX)) {
					images.createIndex(BY_USER_PROJECT_INDEX, [
						"userId",
						"languageCode",
						"bookCode",
						"chapter",
					]);
				}

				if (!db.objectStoreNames.contains(BLOB_STORE)) {
					db.createObjectStore(BLOB_STORE, { keyPath: "imageId" });
				}
				if (!db.objectStoreNames.contains(META_STORE)) {
					db.createObjectStore(META_STORE, { keyPath: "key" });
				}
				// Keyed by imageId, so the store holds exactly the latest unsent
				// text per image rather than one row per edit.
				if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
					const outbox = db.createObjectStore(OUTBOX_STORE, {
						keyPath: "imageId",
					});
					outbox.createIndex(BY_USER_INDEX, "userId");
				}
			};

			request.onsuccess = (event) => {
				resolve((event.target as IDBOpenDBRequest).result);
			};

			request.onerror = () => {
				console.error("Error opening IndexedDB", request.error);
				reject(request.error);
			};
		});
	}

	public static getInstance(): IndexedDBImageRepository {
		return IndexedDBImageRepository.instance;
	}

	private async db(): Promise<IDBDatabase> {
		const db = await this.dbPromise;
		await this.migrateLegacyRecords(db);
		return db;
	}

	/**
	 * Splits pre-v4 records - which carried a base64 data URL on the metadata
	 * row - into metadata plus a real Blob.
	 *
	 * Runs after open rather than inside onupgradeneeded because converting a
	 * data URL needs `fetch`, and an upgrade transaction cannot survive an await.
	 *
	 * Best-effort by design: the server is the source of truth, so the worst case
	 * for a record we cannot attribute to a user is re-downloading its bytes.
	 */
	private migrateLegacyRecords(db: IDBDatabase): Promise<void> {
		if (this.migration) {
			return this.migration;
		}

		this.migration = (async () => {
			const metaTx = db.transaction(META_STORE, "readonly");
			const flag = await promisify(
				metaTx.objectStore(META_STORE).get(MIGRATED_V4_KEY),
			);
			if (flag) {
				return;
			}

			const readTx = db.transaction(IMAGE_STORE, "readonly");
			const legacy = await promisify<TranscribableDocument[]>(
				readTx.objectStore(IMAGE_STORE).getAll(),
			);
			// Null before the first login. A record migrated under "" would
			// never match getAllForUser again, so ownerless records are
			// deferred rather than stranded.
			const fallbackUserId = localStorage.getItem("userId");
			let deferred = false;

			for (const record of legacy) {
				const data = record.data;
				if (typeof data !== "string" || !data.startsWith("data:")) {
					continue;
				}
				const userId = record.userId
					? String(record.userId)
					: fallbackUserId;
				if (!userId) {
					deferred = true;
					continue;
				}
				try {
					const blob = await (await fetch(data)).blob();
					const tx = db.transaction(
						[IMAGE_STORE, BLOB_STORE],
						"readwrite",
					);
					tx.objectStore(BLOB_STORE).put({
						imageId: record.id,
						userId,
						blob,
					});
					tx.objectStore(IMAGE_STORE).put(toStored(userId, record));
					await transactionDone(tx);
				} catch (error) {
					console.error(
						`Failed migrating image ${record.id} to v4 layout`,
						error,
					);
				}
			}

			if (deferred) {
				// Some records still have no owner. Leave the flag unset and
				// let a later call (after login) run the migration again.
				this.migration = null;
				return;
			}

			const doneTx = db.transaction(META_STORE, "readwrite");
			doneTx.objectStore(META_STORE).put({
				key: MIGRATED_V4_KEY,
				value: Date.now(),
			});
			await transactionDone(doneTx);
		})();

		return this.migration;
	}

	// --- metadata ------------------------------------------------------------

	/** Every image belonging to a user, across all languages, books, chapters. */
	async getAllForUser(userId: string): Promise<TranscribableDocument[]> {
		const db = await this.db();
		const tx = db.transaction(IMAGE_STORE, "readonly");
		const index = tx.objectStore(IMAGE_STORE).index(BY_USER_INDEX);
		const records = await promisify<StoredImage[]>(
			index.getAll(IDBKeyRange.only(userId)),
		);

		for (const record of records) {
			this.recentLanguages.add(record.languageCode);
		}
		return records as unknown as TranscribableDocument[];
	}

	/**
	 * Images for one language/book/chapter tuple. No live callers today - reads
	 * go through getAllForUser - but kept as the seam project navigation will use,
	 * now backed by an index instead of a full scan.
	 */
	async getImages(
		userId: string,
		languageCode: string,
		bookCode: string,
		chapter: number,
	): Promise<TranscribableDocument[]> {
		const db = await this.db();
		const tx = db.transaction(IMAGE_STORE, "readonly");
		const index = tx.objectStore(IMAGE_STORE).index(BY_USER_PROJECT_INDEX);
		const records = await promisify<StoredImage[]>(
			index.getAll(
				IDBKeyRange.only([userId, languageCode, bookCode, chapter]),
			),
		);
		return records as unknown as TranscribableDocument[];
	}

	private async getImage(
		userId: string,
		imageId: string,
	): Promise<TranscribableDocument | null> {
		const db = await this.db();
		const tx = db.transaction(IMAGE_STORE, "readonly");
		const record = await promisify<StoredImage | undefined>(
			tx.objectStore(IMAGE_STORE).get(imageId),
		);
		if (!record || record.userId !== userId) {
			return null;
		}
		return record as unknown as TranscribableDocument;
	}

	async putImage(
		userId: string,
		document: TranscribableDocument,
	): Promise<void> {
		const db = await this.db();
		const tx = db.transaction(IMAGE_STORE, "readwrite");
		tx.objectStore(IMAGE_STORE).put(toStored(userId, document));
		await transactionDone(tx);
		this.recentLanguages.add(document.languageCode);
	}

	/** Drops an image's metadata and its cached bytes together. */
	async deleteImage(userId: string, imageId: string): Promise<void> {
		const existing = await this.getImage(userId, imageId);
		if (!existing) {
			return;
		}
		const db = await this.db();
		const tx = db.transaction([IMAGE_STORE, BLOB_STORE], "readwrite");
		tx.objectStore(IMAGE_STORE).delete(imageId);
		tx.objectStore(BLOB_STORE).delete(imageId);
		await transactionDone(tx);
	}

	getRecentLanguages(): string[] {
		return [...this.recentLanguages];
	}

	// --- blobs ---------------------------------------------------------------

	async getBlob(userId: string, imageId: string): Promise<Blob | null> {
		const db = await this.db();
		const tx = db.transaction(BLOB_STORE, "readonly");
		const record = await promisify<
			{ imageId: string; userId: string; blob: Blob } | undefined
		>(tx.objectStore(BLOB_STORE).get(imageId));
		if (!record || record.userId !== userId) {
			return null;
		}
		return record.blob;
	}

	async putBlob(userId: string, imageId: string, blob: Blob): Promise<void> {
		const db = await this.db();
		const tx = db.transaction(BLOB_STORE, "readwrite");
		tx.objectStore(BLOB_STORE).put({ imageId, userId, blob });
		await transactionDone(tx);
	}

	/**
	 * Overwrites a user's snapshot with the server's list.
	 *
	 * A wholesale replace, not a merge: images absent from `documents` are dropped
	 * along with their cached bytes. That is what makes a delete elsewhere take
	 * effect here without tombstones or a cursor to keep straight.
	 *
	 * Transcription text comes from `documents` and is never carried over from what
	 * was already here. Do not add a "keep the old text if..." branch - any such
	 * condition needs a version to compare against, and there is deliberately no
	 * version here. Preserving text across a replace is what made it go stale.
	 *
	 * Unsent local edits are overlaid afterwards, here and nowhere else, since they
	 * are the one case where the local copy legitimately beats the server's.
	 */
	async replaceImages(
		userId: string,
		documents: TranscribableDocument[],
	): Promise<void> {
		const existing = await this.getAllForUser(userId);
		const incomingIds = new Set(documents.map((document) => document.id));
		const removed = existing
			.filter((image) => !incomingIds.has(image.id))
			.map((image) => image.id);
		const unsent = new Map(
			(await this.listUnsentText(userId)).map((entry) => [
				entry.imageId,
				entry.text,
			]),
		);

		const db = await this.db();
		const tx = db.transaction([IMAGE_STORE, BLOB_STORE], "readwrite");
		const images = tx.objectStore(IMAGE_STORE);
		const blobs = tx.objectStore(BLOB_STORE);

		for (const id of removed) {
			images.delete(id);
			// Bytes for a deleted image are dead weight; nothing can display them.
			blobs.delete(id);
		}
		for (const document of documents) {
			const draft = unsent.get(document.id);
			images.put(
				toStored(userId, {
					...document,
					...(draft != null
						? { transcription: draft, hasTranscription: true }
						: {}),
				}),
			);
		}
		await transactionDone(tx);

		for (const document of documents) {
			this.recentLanguages.add(document.languageCode);
		}
	}

	// --- outbox: the offline text cache ------------------------------------

	/**
	 * Records an unsent edit, replacing any earlier unsent edit for the same image.
	 * The user's newest text is what matters; superseded drafts are not history
	 * worth keeping and would only be sent and discarded in turn.
	 */
	async saveUnsentText(
		userId: string,
		imageId: string,
		text: string,
	): Promise<void> {
		const db = await this.db();
		const tx = db.transaction(OUTBOX_STORE, "readwrite");
		tx.objectStore(OUTBOX_STORE).put({
			imageId,
			userId,
			text,
			attempts: 0,
			updatedAt: Date.now(),
		});
		await transactionDone(tx);
	}

	/** Every unsent edit for a user, oldest first. */
	async listUnsentText(userId: string): Promise<OutboxEntry[]> {
		const db = await this.db();
		const tx = db.transaction(OUTBOX_STORE, "readonly");
		const index = tx.objectStore(OUTBOX_STORE).index(BY_USER_INDEX);
		const entries = await promisify<OutboxEntry[]>(
			index.getAll(IDBKeyRange.only(userId)),
		);
		return entries.sort((a, b) => a.updatedAt - b.updatedAt);
	}

	/**
	 * The unsent text for one image, if any. Read before the server's copy when
	 * displaying, since an unsent edit is by definition newer.
	 */
	async getUnsentText(
		userId: string,
		imageId: string,
	): Promise<OutboxEntry | null> {
		const db = await this.db();
		const tx = db.transaction(OUTBOX_STORE, "readonly");
		const entry = await promisify<OutboxEntry | undefined>(
			tx.objectStore(OUTBOX_STORE).get(imageId),
		);
		if (!entry || entry.userId !== userId) {
			return null;
		}
		return entry;
	}

	/**
	 * Drops the cached text for an image. Called only after the server has
	 * accepted it - that acknowledgement is the single condition under which
	 * locally held text may be discarded.
	 */
	async clearUnsentText(imageId: string): Promise<void> {
		const db = await this.db();
		const tx = db.transaction(OUTBOX_STORE, "readwrite");
		tx.objectStore(OUTBOX_STORE).delete(imageId);
		await transactionDone(tx);
	}

	/**
	 * Notes a failed send. Deliberately keeps the text: a send that keeps failing
	 * is exactly when the user most needs their draft retained.
	 */
	async recordFailedAttempt(entry: OutboxEntry): Promise<void> {
		const db = await this.db();
		const tx = db.transaction(OUTBOX_STORE, "readwrite");
		tx.objectStore(OUTBOX_STORE).put({
			...entry,
			attempts: entry.attempts + 1,
		});
		await transactionDone(tx);
	}
}

export default IndexedDBImageRepository;
