import { getCurrentUserId } from "@src/domain/CurrentUser.ts";
import syncEngine from "@src/services/SyncEngine.ts";
import { useEffect, useState } from "react";

/**
 * An object URL for an image's bytes.
 *
 * Served from the IndexedDB blob cache when present, otherwise fetched once from
 * the server and cached - so scrolling back to a page never re-downloads it, and
 * neither does a refresh.
 *
 * The URL is revoked when the id changes or the component unmounts; without that
 * every viewed image would pin its bytes in memory for the life of the tab.
 */
export function useImageBlobUrl(imageId: string | undefined): string | null {
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		const userId = getCurrentUserId();
		if (!imageId || !userId) {
			setUrl(null);
			return;
		}

		let revoked = false;
		let current: string | null = null;

		syncEngine
			.getBlobUrl(userId, imageId)
			.then((objectUrl) => {
				if (revoked) {
					// Unmounted while fetching - release immediately.
					if (objectUrl) URL.revokeObjectURL(objectUrl);
					return;
				}
				current = objectUrl;
				setUrl(objectUrl);
			})
			.catch((error) => {
				console.error(`Could not load image ${imageId}`, error);
				setUrl(null);
			});

		return () => {
			revoked = true;
			if (current) {
				URL.revokeObjectURL(current);
			}
		};
	}, [imageId]);

	return url;
}
