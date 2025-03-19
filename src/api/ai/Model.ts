import type { ApiKeyStatus } from "./ApiKeyStatus";
import type { TranscriptionResponse } from "./TranscriptionResponse";

export default interface Model {
	baseUrl: string;
	keyStatus(key: string): Promise<ApiKeyStatus>;
	transcribe(base64Image: any): Promise<TranscriptionResponse>;
}
