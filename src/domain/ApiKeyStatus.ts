export enum ApiKeyStatus {
    Valid,
    Invalid,
    RateLimited, // Add if you want to check for rate limiting specifically
    Missing
}