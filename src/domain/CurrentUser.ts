/**
 * The signed-in WACS user id, as stashed by the login flow.
 *
 * Everything that touches IndexedDB needs this: records are scoped per user so a
 * shared browser never shows one account another's scans. Reads and writes go
 * through IndexedDBImageRepository, whose methods all demand a userId - this is
 * where callers get it.
 */
export function getCurrentUserId(): string | null {
	return localStorage.getItem("userId");
}

/**
 * Same, but throws instead of returning null. Use inside flows that only run
 * behind the auth gate, where a missing user is a bug rather than a state to
 * handle.
 */
export function requireCurrentUserId(): string {
	const userId = getCurrentUserId();
	if (!userId) {
		throw new Error("No signed-in user - cannot access local image store");
	}
	return userId;
}
