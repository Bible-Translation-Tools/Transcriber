import { ApiKeyStatus } from "./ApiKeyStatus";
import { TranscriptionResponse } from "./TranscriptionResponse";

export default interface Model {
    baseUrl: string,

    keyIsValid(key: string): Promise<ApiKeyStatus>

    transcribe(base64Image: any): Promise<TranscriptionResponse>  
}