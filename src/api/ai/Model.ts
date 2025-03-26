import type { TranscriptionResponse } from "./TranscriptionResponse";

export default interface Model {
	baseUrl: string;
	transcribe(base64Image: any): Promise<TranscriptionResponse>;
}
