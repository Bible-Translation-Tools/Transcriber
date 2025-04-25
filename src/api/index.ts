import {
	HandleTranscriptionRequest,
	HandleUpdateTranscriptionRequest,
	transcriptionRequestSchema,
	updateTranscriptionRequestSchema,
} from "@api/domain/HandleTranscriptionRequest";
import { TranscriptionModel } from "@api/domain/TranscriptionRequest";
import { Hono } from "hono";
import { authRouter } from "./auth/router";

import { TRANSCRIBE_ROUTE, UPDATE_TRANSCRIPTION_ROUTE } from "@src/constants";
import * as v from "valibot";
import type { HonoBindings } from "./auth/utils";
import { mockHandleTranscriptionRequest } from "./domain/mock";
import { D1TranscriptionRepository } from "./persistence/D1TranscriptionRepository";
import { R2ImageRepository } from "./persistence/R2ImageRepository";

export const apiV1 = "/api/v1";
const apiV1Router = new Hono<HonoBindings>();
apiV1Router.basePath(apiV1);

apiV1Router.post(`${TRANSCRIBE_ROUTE}`, async (c) => {
	console.log("Recieved transcription request");
	const user = c.get("user");
	const body = await c.req.json();
	const parsed = v.safeParse(transcriptionRequestSchema, body);
	if (!parsed.success) {
		parsed.issues.forEach((issue) => console.log(issue.message));
		return c.json({ error: "Invalid request format" }, { status: 400 });
	}

	const bucket = c.env.HTR_STORAGE;
	const repo = new D1TranscriptionRepository(
		c.env.HTR_DATABASE,
		new R2ImageRepository(bucket),
	);
	let htrRes: Response;
	if (import.meta.env.DEV) {
		htrRes = await mockHandleTranscriptionRequest(
			String(user.wacsUserId),
			createApiMap(c.env),
			parsed.output,
			repo,
		);
	} else {
		htrRes = await HandleTranscriptionRequest(
			String(user.wacsUserId),
			createApiMap(c.env),
			parsed.output,
			repo,
		);
	}
	return htrRes;
});

apiV1Router.post(`${UPDATE_TRANSCRIPTION_ROUTE}`, async (c) => {
	console.log("Recieved update request.");
	const body = await c.req.json();
	const parsed = v.safeParse(updateTranscriptionRequestSchema, body);
	if (!parsed.success) {
		return c.json({ error: "Invalid request format" }, { status: 400 });
	}

	const bucket = c.env.HTR_STORAGE;
	const repo = new D1TranscriptionRepository(
		c.env.HTR_DATABASE,
		new R2ImageRepository(bucket),
	);
	const htrRes = await HandleUpdateTranscriptionRequest(parsed.output, repo);
	return htrRes;
});

apiV1Router.route("/auth", authRouter);

function createApiMap(env: Env): Map<TranscriptionModel, string> {
	const keys = new Map<TranscriptionModel, string>();
	keys.set(TranscriptionModel.OPENAI, env.OPENAI_KEY);
	keys.set(TranscriptionModel.PIXTRAL, env.MISTRAL_KEY);
	return keys;
}

export { apiV1Router };
