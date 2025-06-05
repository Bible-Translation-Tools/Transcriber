import type { TranscriptionResponse } from "@api/ai/TranscriptionResponse";
import type { TranscriptionImage } from "@api/data/TranscriptionImage";
import type { D1TranscriptionRepository } from "@api/persistence/D1TranscriptionRepository";
import type { TranscriptionRequest } from "./HandleTranscriptionRequest";
import type { TranscriptionModel } from "./TranscriptionRequest";

export async function mockHandleTranscriptionRequest(
	userId: string,
	apiKeys: Map<TranscriptionModel, string>,
	body: TranscriptionRequest,
	imageRepo: D1TranscriptionRepository,
): Promise<Response> {
	console.log("Mocking Handling Transcription Request");
	const mockedTranscription = `
  SALAM
1 Paulus Yesus Kristus ma hripor ndo dua mo rasul Injil Allah ndot 2 Injil mawya Allah kea pretpien heta naNggak nabi-nabi Mi ma nanggak Kitab Suci nen 3 mandama detnan tumdi gemein daud nanggak peitmo 4 Kono Allah ma manda ndopou Mi ma roh kana, mbohob ke Mi ma Kekudusan kana ndo hi, mo Yesus Kristus mbi ma Tuhan 5 Mi groma nanggak, mbi a anugerah kono kerasulan mombeh mbi ma iman Mi ma Ne mo, Hiriet Yahudi nangmba mo 6 kono mbi kidua mo Kristus Yesus ma 7 Qi Roma nen twebimo, Allah kea Qinamban, kono Qidua mo Mi ma toumndi kudus, anugerah Qi kwin, kono pohi Allah groma, mbi ma Nia, kono Tuhan Yesus Kristus. 8 Paha mo on a syoh on ma Allah Kristus Yesus koma ki herengdik ma kotpein mo hiriet yo ndo keri 9 Tabe Allah, on ndo kono on kotpein kana Mi ma Mandama makmo onke kono mo kinenuk taden 10 Ona ma ndo kabarmon, Allah mbeh onma qihowot kono.`;
	const transcriptionResponse: TranscriptionResponse = {
		success: true,
		imageId: body.imageId,
		transcription: mockedTranscription,
	};
	const image: TranscriptionImage = {
		id: body.imageId,
		user_deleted: false,
		userId: userId,
		path: `${userId}/${body.imageId}`,
		filename: body.filename,
		data: body.image,
		book_code: body.bookCode,
		language_code: body.languageCode,
		created: body.created,
		chapter: body.chapter,
		verse_start: 0,
		verse_end: 0,
		transcription: [
			{
				human_modified: false,
				prompt: body.prompt,
				system_prompt: body.systemPrompt,
				date: Date.now(),
				model: body.model,
				text: mockedTranscription,
			},
		],
	};
	console.log("Storing mocked transcription.");
	await imageRepo.createTranscriptionImage(image);
	console.log("Returning mocked transcription response.");

	return Response.json(transcriptionResponse);
}
