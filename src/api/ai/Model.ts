import type { TranscriptionResponse } from "./TranscriptionResponse";

export default interface Model {
	baseUrl: string;
	transcribe(
		imageId: string,
		base64Image: string,
	): Promise<TranscriptionResponse>;
}
