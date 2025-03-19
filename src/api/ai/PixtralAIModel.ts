import { MistralClient } from "@mistralai/mistral";
import { ApiKeyStatus } from "./ApiKeyStatus";
import type Model from "./Model";

class PixtralModel implements Model {
	baseUrl = "https://api.mistral.ai/v1/models";
	key: string;

	constructor(key: string) {
		this.key = key;
	}

	async keyIsValid(key: string): Promise<ApiKeyStatus> {
		try {
			const mistral = new MistralClient({ apiKey: key });

			// A simple request to check the key.  We'll use model list.
			await mistral.models.list(); // Or any other simple API call.
			return ApiKeyStatus.Valid;
		} catch (error: any) {
			// Mistral errors are often returned with a status code in error.response
			if (error.response) {
				const status = error.response.status;
				if (status === 401) {
					console.error("Mistral API Key Invalid:", error.message);
					return ApiKeyStatus.Invalid;
				}
				if (status === 403) {
					// Example: Check for Forbidden (might indicate rate limit or other issues)
					console.error("Mistral API Key Forbidden:", error.message);
					return ApiKeyStatus.RateLimited; // Or OtherError, depending on how you want to categorize it.
				}
				if (status === 429) {
					console.error(
						"Mistral API Key Rate Limited:",
						error.message,
					);
					return ApiKeyStatus.RateLimited;
				}
				console.error(`Mistral API Error (${status}):`, error.message);
				return ApiKeyStatus.OtherError;
			}
			if (error.message.includes("NetworkError")) {
				// Check for network errors
				console.error(
					"Network Error checking Mistral API Key:",
					error.message,
				);
				return ApiKeyStatus.NetworkError;
			}
			if (error.message.includes("Incorrect API key provided")) {
				console.error("Mistral API Key Invalid:", error.message);
				return ApiKeyStatus.Invalid;
			}
			console.error("Other Error checking Mistral API Key:", error);
			return ApiKeyStatus.OtherError;
		}
	}
}
