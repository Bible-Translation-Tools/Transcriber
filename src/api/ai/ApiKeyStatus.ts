export enum ApiKeyStatus {
	Valid = 0,
	Invalid = 1,
	RateLimited = 2, // Add if you want to check for rate limiting specifically
	Missing = 3,
}
