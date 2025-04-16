import { authRouter } from "./auth/router";
import {
	HandleTranscriptionRequest,
	HandleUpdateTranscriptionRequest,
	transcriptionRequestSchema,
	updateTranscriptionRequestSchema,
} from "@api/domain/HandleTranscriptionRequest";
import { TranscriptionModel } from "@api/domain/TranscriptionRequest";
import { Hono } from "hono";

import { validator } from "hono/validator";
import * as v from "valibot";
import { D1TranscriptionRepository } from "./persistence/D1TranscriptionRepository";
import { R2ImageRepository } from "./persistence/R2ImageRepository";
import type { HonoBindings } from "./auth/utils";
import { transcribeRoute, updateTranscriptionRoute } from "@src/constants";

export const apiV1 = "/api/v1";
const apiV1Router = new Hono<HonoBindings>();
apiV1Router.basePath(apiV1);

apiV1Router.post(
	`${transcribeRoute}`,
	validator("json", (value) => {
		// throws if invalid
		const parsed = v.safeParse(transcriptionRequestSchema, value);
		if (!parsed.success) {
			console.error("invalid transcription request");
			console.log(value);
			return new Response(
				JSON.stringify({ error: "Invalid request format" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
		return parsed.output;
	}),
	async (c) => {
		console.log("Recieved transcription request");
		const user = c.get("user");
		const body = c.req.valid("json");

		const bucket = c.env.HTR_STORAGE;
		const repo = new D1TranscriptionRepository(
			c.env.HTR_DATABASE,
			new R2ImageRepository(bucket),
		);

		const htrRes = await HandleTranscriptionRequest(
			String(user.wacsUserId),
			createApiMap(c.env),
			body,
			repo,
		);
		return htrRes;
	},
);

apiV1Router.post(
	`${updateTranscriptionRoute}`,
	validator("json", (value) => {
		// throws if invalid
		const parsed = v.safeParse(updateTranscriptionRequestSchema, value);
		if (!parsed.success) {
			console.error("invalid transcription update request");
			return new Response(
				JSON.stringify({ error: "Invalid request format" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
		return parsed.output;
	}),
	async (c) => {
		console.log("Recieved update request.");
		const body = c.req.valid("json");

		const bucket = c.env.HTR_STORAGE;
		const repo = new D1TranscriptionRepository(
			c.env.HTR_DATABASE,
			new R2ImageRepository(bucket),
		);

		console.log(JSON.stringify(body));
		const htrRes = await HandleUpdateTranscriptionRequest(body, repo);
		return htrRes;
	},
);

apiV1Router.route("/auth", authRouter);

function createApiMap(env: Env): Map<TranscriptionModel, string> {
	const keys = new Map<TranscriptionModel, string>();
	keys.set(TranscriptionModel.OPENAI, env.OPENAI_KEY);
	keys.set(TranscriptionModel.PIXTRAL, env.MISTRAL_KEY);
	return keys;
}

export { apiV1Router };
