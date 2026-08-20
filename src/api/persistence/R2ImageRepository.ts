// image-repository.ts
export class R2ImageRepository {
	private bucket: R2Bucket;

	constructor(bucket: R2Bucket) {
		this.bucket = bucket;
	}

	async storeImage(imagePath: string, imageData: string): Promise<string> {
		const key = imagePath;
		await this.bucket.put(key, imageData, {
			httpMetadata: { contentType: "text/plain" },
		});
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

/**
 * Objects in R2 are stored as the base64 data URL the browser produced, saved as
 * text/plain (see storeImage above). Clients want real bytes, so unwrap here.
 */
export function decodeStoredImage(buffer: ArrayBuffer): {
	bytes: Uint8Array;
	contentType: string;
} {
	const asText = new TextDecoder("utf-8").decode(buffer);
	const match = /^data:([^;,]+);base64,(.*)$/s.exec(asText);

	if (!match) {
		// Not a data URL. Either an older or a future format - hand back the raw
		// bytes rather than corrupting them with a failed base64 decode.
		return {
			bytes: new Uint8Array(buffer),
			contentType: "application/octet-stream",
		};
	}

	const [, contentType, base64] = match;
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	return { bytes, contentType };
}
