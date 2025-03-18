import {
	HandleTranscriptionRequest,
	transcriptionRequestSchema,
} from "@api/domain/HandleTranscriptionRequest";
import { TranscriptionModel } from "@api/domain/TranscriptionRequest";
import { Context, Hono, Next } from "hono";
import { some } from "hono/combine";
import { type JwtVariables, decode } from "hono/jwt";
import { logger } from "hono/logger";
const apiV1Router = new Hono<{
	Bindings: Env;
	Variables: JwtVariables;
}>();
import { getOauthTokens, setLoginCookies } from "@api/auth/login";
import { authRouter } from "@api/auth/router";
import { checkOrRefresh, getR2Keys } from "@api/auth/utils";
import {
	CSRF_STATE_KEY,
	GRANT_CODE_FLOW,
	GRANT_REFRESH_TOKEN,
	WACS_API_REFRESH_TOKEN,
	WACS_API_TOKEN,
	WACS_USER_TOKEN,
} from "@src/constants";
import { getCookie } from "hono/cookie";
import { jwk } from "hono/jwk";
import { validator } from "hono/validator";
import * as v from "valibot";

export const apiV1 = "/api/v1";
export const transcribeRoute = "/transcribe/";

apiV1Router.use("*", logger());

// This is the only ai route right now and we don't need to register middleware for the auth route itself, but if they had a common prefix, we could group as use (routePrefix, middles)
// check for access Token first
apiV1Router.post(transcribeRoute, async (c, next) => {
	return checkOrRefresh(c, next);
});
// apiV1Router.get("checkTest", async (c, next) => {
// 	return checkOrRefresh(c, next);
// });

// apiV1Router.get("checkTest", async (c, next) => {
// 	const jwtPayload = c.get("jwtPayload");
// 	console.log({ jwtPayload });
// 	console.log("middleware should run first");
// 	return c.json({ jwtPayload });
// });

apiV1Router.post(
	`${transcribeRoute}`,
	validator("json", (value) => {
		// throws if invalid
		const parsed = v.safeParse(transcriptionRequestSchema, value);
		if (!parsed.success) {
			console.error("invalid transcription request");
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
		const jwtPayload = c.get("jwtPayload");
		console.log({ jwtPayload });
		const body = c.req.valid("json");
		const htrRes = await HandleTranscriptionRequest(
			createApiMap(c.env),
			body,
		);
		return htrRes;
	},
);

apiV1Router.route("/auth", authRouter);

//
function createApiMap(env: Env): Map<TranscriptionModel, string> {
	const keys = new Map<TranscriptionModel, string>();
	keys.set(TranscriptionModel.OPENAI, env.OPENAI_KEY);
	return keys;
}

export { apiV1Router };
