import type { TranscriptionStatus } from "@src/data/TranscriptionStatus.ts";
import * as v from "valibot";

export interface TranscribableDocument {
	[key: string]:
		| string
		| number
		| undefined
		| EpochTimeStamp
		| null
		| boolean
		| unknown;
	id: string;
	filename: string;
	created: EpochTimeStamp;
	data: any;
	transcription: string | undefined | null; // Optional transcription
	languageCode: string;
	bookCode: string;
	chapter: number;
	startVerse?: number | undefined;
	endVerse?: number | undefined;
	status: TranscriptionStatus;
}

// todo: maybe use
export const transcribableDocumentSchema = v.object({
	id: v.string(),
	filename: v.string(),
	created: v.number(),
	data: v.any(),
	transcription: v.optional(v.string()),
	languageCode: v.string(),
	bookCode: v.string(),
	chapter: v.number(),
	startVerse: v.optional(v.number()),
	endVerse: v.optional(v.number()),
	status: v.optional(v.string()),
});

const safeParseTranscribableDocument = (input: unknown) => {
	const { issues, output, success, typed } = v.safeParse(
		transcribableDocumentSchema,
		input,
	);
	return { issues, output, isWellFormed: success, typed };
};
