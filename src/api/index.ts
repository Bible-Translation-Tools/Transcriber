import { authRouter } from "@api/auth/router";
import { checkOrRefresh, syncR2Keys } from "@api/auth/utils";
import {
    HandleTranscriptionRequest,
    transcriptionRequestSchema,
} from "@api/domain/HandleTranscriptionRequest";
import { TranscriptionModel, TranscriptionRequest } from "@api/domain/TranscriptionRequest";
import { TranscriptionImage } from "@src/data/TranscriptionImage";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { except } from "hono/combine";
import type { JwtVariables } from "hono/jwt";
import { logger } from "hono/logger";
import { validator } from "hono/validator";
import * as v from "valibot";
import { messages } from "../api/persistence/schema";
import { D1TranscriptionRepository } from "./persistence/D1TranscriptionRepository";
import { R2ImageRepository } from "./persistence/R2ImageRepository";

export const apiV1 = "/api/v1";
const apiV1Router = new Hono<{
    Bindings: Env;
    Variables: JwtVariables;
}>();
apiV1Router.basePath(apiV1);

export const transcribeRoute = "/transcriber/";

apiV1Router.use("*", logger());
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

apiV1Router.get("checkTest", async (c, next) => {
    const jwtPayload = c.get("jwtPayload");
    return c.json({ jwtPayload });
});

apiV1Router.post(
    `${transcribeRoute}`,
    validator("json", (value) => {
        // throws if invalid
        const parsed = v.safeParse(transcriptionRequestSchema, value);
        if (!parsed.success) {
            console.error(`invalid transcription request`);
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
        const body = c.req.valid("json");

        const bucket = c.env.HTR_STORAGE;
        const repo = new D1TranscriptionRepository(c.env.HTR_DATABASE, new R2ImageRepository(bucket))
    
        const user = jwtPayload.sub;

        const htrRes = await HandleTranscriptionRequest(
            user,
            createApiMap(c.env),
            body,
            repo
        );
        return htrRes;
    },
);

apiV1Router.route("/auth", authRouter);

function createApiMap(env: Env): Map<TranscriptionModel, string> {
    const keys = new Map<TranscriptionModel, string>();
    keys.set(TranscriptionModel.OPENAI, env.OPENAI_KEY);
    return keys;
}

export { apiV1Router };
