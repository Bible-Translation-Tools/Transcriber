// image-repository.ts
export class R2ImageRepository {
    private bucket: R2Bucket;

    constructor(bucket: R2Bucket) {
        this.bucket = bucket;
    }

    async storeImage(imageId: string, imageData: ArrayBuffer): Promise<string> {
        const key = `images/${imageId}`; // Example key structure
        await this.bucket.put(key, imageData);
        return key; // Return the R2 key as the file path
    }

    async retrieveImage(key: string): Promise<ArrayBuffer | null> {
        const object = await this.bucket.get(key);
        if (!object) {
            return null;
        }
        return object.arrayBuffer();
    }
}