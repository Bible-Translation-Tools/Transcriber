import { authRouter } from "@api/auth/router";
import { checkOrRefresh, syncR2Keys } from "@api/auth/utils";
import {
	HandleTranscriptionRequest,
	HandleUpdateTranscriptionRequest,
	transcriptionRequestSchema,
	updateTranscriptionRequestSchema,
} from "@api/domain/HandleTranscriptionRequest";
import { TranscriptionModel } from "@api/domain/TranscriptionRequest";
import { Hono } from "hono";
import { except } from "hono/combine";
import type { JwtVariables } from "hono/jwt";
import { validator } from "hono/validator";
import * as v from "valibot";
import { D1TranscriptionRepository } from "./persistence/D1TranscriptionRepository";
import { R2ImageRepository } from "./persistence/R2ImageRepository";
import { mockHandleTranscriptionRequest } from "./domain/mock";

export const apiV1 = "/api/v1";
const apiV1Router = new Hono<{
	Bindings: Env;
	Variables: JwtVariables & {
		user: string | null;
	};
}>();
apiV1Router.basePath(apiV1);

export const transcribeRoute = "/transcriber/";
export const updateTranscriptionRoute = "/updateTranscription/";

apiV1Router.use(
	"*",
	except([`${apiV1}/auth/logout`], (c, next) => syncR2Keys(c, next)),
);

// MIDDLEWARES. no response returned here.
// This is the only ai route right now and we don't need to register middleware for the auth route itself, but if they had a common prefix, we could group as use (routePrefix, middles)
// check for access Token first
apiV1Router.post(transcribeRoute, async (c, next) => {
	return await checkOrRefresh(c, next);
});

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
		const userStringified = c.get("user");
		const user = userStringified ? JSON.parse(userStringified) : null;
		if (!user) {
			console.error("No user found in request");
			return c.redirect("/");
		}
		const body = c.req.valid("json");

		const bucket = c.env.HTR_STORAGE;
		const repo = new D1TranscriptionRepository(
			c.env.HTR_DATABASE,
			new R2ImageRepository(bucket),
		);
		let htrRes: Response;
		// todo: give a more granular toggle for mocking search as a query param?
		if (import.meta.env.DEV) {
			htrRes = await mockHandleTranscriptionRequest();
		} else {
			htrRes = await HandleTranscriptionRequest(
				user,
				createApiMap(c.env),
				body,
				repo,
			);
		}
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
