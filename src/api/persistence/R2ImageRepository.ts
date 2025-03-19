// image-repository.ts
export class R2ImageRepository {
    private bucket: R2Bucket;

    constructor(bucket: R2Bucket) {
        this.bucket = bucket;
    }

    async storeImage(imagePath: string, imageData: string): Promise<string> {
        const key = imagePath
        await this.bucket.put(key, imageData, { httpMetadata: { contentType: 'text/plain' }, });
        return key;
    }

    async retrieveImage(key: string): Promise<ArrayBuffer | null> {
        const object = await this.bucket.get(key);
        if (!object) {
            return null;
        }
        return object.arrayBuffer();
    }
}