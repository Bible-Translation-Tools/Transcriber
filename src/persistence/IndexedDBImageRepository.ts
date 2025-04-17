import { openDB, type IDBPDatabase } from "idb";
import type { ImageData } from "@src/data/ImageData.tsx";

const DB_NAME = "imageDB";
const DB_VERSION = 1;
const META_STORE = "image-meta";
const DATA_STORE = "image-data";

type ImageMetadata = Omit<ImageData, "data">;

class IndexedDBImageRepository {
	private static instance: IndexedDBImageRepository =
		new IndexedDBImageRepository();

	private dbPromise: Promise<IDBPDatabase>;
	private recentLanguages = new Set<string>();

	private constructor() {
		this.dbPromise = openDB(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains(META_STORE)) {
					db.createObjectStore(META_STORE);
				}
				if (!db.objectStoreNames.contains(DATA_STORE)) {
					db.createObjectStore(DATA_STORE);
				}
			},
		});
	}

	getRecentLanguages(): string[] {
		return [...this.recentLanguages];
	}

	async storeImage(imageId: string, image: ImageData): Promise<string> {
		const db = await this.dbPromise;
		const { data, ...metadata } = image;

		const tx = db.transaction([META_STORE, DATA_STORE], "readwrite");
		await Promise.all([
			tx.objectStore(META_STORE).put(metadata, imageId),
			tx.objectStore(DATA_STORE).put(data, imageId),
		]);
		await tx.done;

		this.recentLanguages.add(image.languageCode);
		console.log("Image stored successfully.", imageId);
		return imageId;
	}

	async retrieveImage(imageId: string): Promise<ImageData | null> {
		console.log(`Retrieving ${imageId}`);
		const db = await this.dbPromise;

		const tx = db.transaction([META_STORE, DATA_STORE], "readonly");
		const metadata = await tx.objectStore(META_STORE).get(imageId);
		const data = await tx.objectStore(DATA_STORE).get(imageId);
		await tx.done;

		if (metadata && data) {
			return { ...metadata, data } as ImageData;
		}
		return null;
	}

	async retrieveAllImages(): Promise<ImageData[] | null> {
		const db = await this.dbPromise;
		const tx = db.transaction([META_STORE, DATA_STORE], "readonly");

		const allMetadata = await tx.objectStore(META_STORE).getAll();
		// const allKeys = await tx.objectStore(META_STORE).getAllKeys();
		// const allData = await Promise.all(
		// 	allKeys.map((key) => tx.objectStore(DATA_STORE).get(key)),
		// );

		await tx.done;

		const images: ImageData[] = [];
		for (let i = 0; i < allMetadata.length; i++) {
			const metadata = allMetadata[i];
			// const data = allData[i];
			if (metadata) {
				images.push(metadata);
				this.recentLanguages.add(metadata.languageCode);
			}
		}

		return images;
	}

	async getImages(
		languageCode: string,
		bookCode: string,
		chapter: number,
	): Promise<ImageData[]> {
		const allImages = await this.retrieveAllImages();
		return (
			allImages?.filter(
				(img) =>
					img.languageCode === languageCode &&
					img.bookCode === bookCode &&
					img.chapter === chapter,
			) ?? []
		);
	}

	public static getInstance(): IndexedDBImageRepository {
		return IndexedDBImageRepository.instance;
	}
}

export default IndexedDBImageRepository;
