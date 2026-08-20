import {
	deleteTranscriptionRequestSchema,
	HandleDeleteTranscriptionRequest,
	HandleTranscriptionRequest,
	HandleUpdateTranscriptionRequest,
	transcriptionRequestSchema,
	updateTranscriptionRequestSchema,
} from "@api/domain/HandleTranscriptionRequest";
import { TranscriptionModel } from "@api/domain/TranscriptionRequest";
import { Hono } from "hono";
import { authRouter } from "./auth/router";

import {
	DELETE_TRANSCRIPTION_ROUTE,
	IMAGE_ROUTE,
	IMAGES_ROUTE,
	TRANSCRIBE_ROUTE,
	UPDATE_TRANSCRIPTION_ROUTE,
} from "@src/constants";
import * as v from "valibot";
import type { HonoBindings } from "./auth/utils";
import { mockHandleTranscriptionRequest } from "./domain/mock";
import { createRepo } from "./persistence/D1TranscriptionRepository";

const apiV1 = "/api/v1";
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

	const repo = createRepo(c.env);
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

	const repo = createRepo(c.env);
	const htrRes = await HandleUpdateTranscriptionRequest(parsed.output, repo);
	return htrRes;
});

apiV1Router.post(`${DELETE_TRANSCRIPTION_ROUTE}`, async (c) => {
	console.log("Recieved delete request.");
	const body = await c.req.json();
	const parsed = v.safeParse(deleteTranscriptionRequestSchema, body);
	if (!parsed.success) {
		return c.json({ error: "Invalid request format" }, { status: 400 });
	}

	const repo = createRepo(c.env);
	const htrRes = await HandleDeleteTranscriptionRequest(parsed.output, repo);
	return htrRes;
});

apiV1Router.get(`${IMAGES_ROUTE}`, async (c) => {
	const user = c.get("user");
	const repo = createRepo(c.env);
	const images = await repo.getImagesForUser(String(user.wacsUserId));
	return c.json({ images });
});

apiV1Router.get(`${IMAGE_ROUTE}/:id`, async (c) => {
	const user = c.get("user");
	const imageId = c.req.param("id");

	const image = await createRepo(c.env).getImageBytes(
		String(user.wacsUserId),
		imageId,
	);
	if (!image) {
		return c.json({ error: "Not found" }, { status: 404 });
	}

	return new Response(image.bytes, {
		headers: {
			"Content-Type": image.contentType,
			"Content-Length": String(image.bytes.byteLength),
			ETag: `"${imageId}"`,
			"Cache-Control": "private, max-age=31536000, immutable",
		},
	});
});

apiV1Router.route("/auth", authRouter);

function createApiMap(env: Env): Map<TranscriptionModel, string> {
	const keys = new Map<TranscriptionModel, string>();
	keys.set(TranscriptionModel.GEMINI, env.GEMINI_KEY);
	keys.set(TranscriptionModel.OPENAI, env.OPENAI_KEY);
	keys.set(TranscriptionModel.PIXTRAL, env.MISTRAL_KEY);
	return keys;
}

export { apiV1Router };
