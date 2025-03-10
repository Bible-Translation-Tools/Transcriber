import { TranscriptionResponse } from "../../api/ai/TranscriptionResponse";
import { TranscriptionModel } from "../../api/domain/TranscriptionRequest"

export default async function getTranscription(image_b64: string): Promise<TranscriptionResponse> {
    console.log("making a request!!")

    const test = await fetch("/api/v1/");
    const res = await test.json();
    console.log(res);

    const response = await fetch("/api/v1/transcribe/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({model: TranscriptionModel.OPENAI, image: image_b64}),
    });
    console.log(response);

    try {
        const json = await response.json();
        console.log(response)
        return json
    } catch (e) {
        console.log(response)
        console.log(e)
    }
}