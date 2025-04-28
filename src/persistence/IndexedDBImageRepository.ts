import type {TranscribableDocument} from "@src/data/TranscribableDocument";

class IndexedDBImageRepository {
	private static instance: IndexedDBImageRepository =
		new IndexedDBImageRepository();

	private dbPromise: Promise<IDBDatabase>;
	private dbName = "imageDB";
	private objectStoreName = "images";
	private recentLanguages = new Set<string>();

	constructor() {
		this.dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, 3);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains(this.objectStoreName)) {
					db.createObjectStore(this.objectStoreName, {
						keyPath: "id",
					});
				}
			};

			request.onsuccess = (event) => {
				console.log("Successfully created IndexedDb instance");
				resolve((event.target as IDBOpenDBRequest).result);
			};

			request.onerror = (event) => {
				console.log("Error creating IndexedDB instance");
				reject((event.target as IDBOpenDBRequest).error);
			};
		});
	}

	getRecentLanguages(): string[] {
		return [...this.recentLanguages];
	}

	async storeImage(
		imageId: string,
		imageData: TranscribableDocument,
	): Promise<string> {
		const db = await this.dbPromise;
		const transaction = db.transaction(this.objectStoreName, "readwrite");
		const store = transaction.objectStore(this.objectStoreName);

		return new Promise((resolve, reject) => {
			const request = store.put(imageData);

			request.onsuccess = () => {
				this.recentLanguages.add(imageData.languageCode);
				console.log("Store image stored successfully. ", imageId);
				resolve(imageId);
			};

			request.onerror = () => {
				console.log("Error storing image. ", imageId);
				reject(request.error);
			};
		});
	}

	async retrieveImage(
		imageId: string,
	): Promise<TranscribableDocument | null> {
		console.log(`Retrieving ${imageId}`);
		const db = await this.dbPromise;
		const transaction = db.transaction(this.objectStoreName, "readonly");
		const store = transaction.objectStore(this.objectStoreName);

		return new Promise((resolve, reject) => {
			const request = store.get(imageId);

			request.onsuccess = () => {
				resolve(request.result as TranscribableDocument | null);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	async retrieveAllImages(): Promise<TranscribableDocument[] | null> {
		const db = await this.dbPromise;
		const transaction = db.transaction(this.objectStoreName, "readonly");
		const store = transaction.objectStore(this.objectStoreName);

		return new Promise((resolve, reject) => {
			const request = store.getAll();

			request.onsuccess = () => {
				if (request.result != null) {
					request.result
						.map(
							(imageData: TranscribableDocument) =>
								imageData.languageCode,
						)
						.forEach((languageCode) => {
							this.recentLanguages.add(languageCode);
						});
				}
				resolve(request.result as TranscribableDocument[] | null);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	async getImages(
		languageCode: string,
		bookCode: string,
		chapter: number,
	): Promise<TranscribableDocument[]> {
		const images = await this.retrieveAllImages();
		return (
			images?.filter((item) => {
				return (
					item.languageCode === languageCode &&
					item.bookCode === bookCode &&
					item.chapter === chapter
				);
			}) ?? []
		);
	}

	public static getInstance(): IndexedDBImageRepository {
		return IndexedDBImageRepository.instance;
	}

	async deleteImage(imageId: string): Promise<void> {
		console.log(`Deleting ${imageId}`);
		const db = await this.dbPromise;
		const transaction = db.transaction(this.objectStoreName, "readwrite");
		const store = transaction.objectStore(this.objectStoreName);

		return new Promise((resolve, reject) => {
			const request = store.delete(imageId);

			request.onsuccess = () => {
				resolve();
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}
}

export default IndexedDBImageRepository;
