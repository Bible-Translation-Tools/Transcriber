import {Context, Hono, Next} from "hono";
import {logger} from "hono/logger";
import {some} from "hono/combine";
import {type JwtVariables, decode} from "hono/jwt";
import {
  HandleTranscriptionRequest,
  transcriptionRequestSchema,
} from "../api/domain/HandleTranscriptionRequest";
import {TranscriptionModel} from "../api/domain/TranscriptionRequest";
const apiV1Router = new Hono<{
  Bindings: Env;
  Variables: JwtVariables;
}>();
import {validator} from "hono/validator";
import * as v from "valibot";
import {authRouter} from "../api/auth/router";
import {jwk} from "hono/jwk";
import {checkOrRefresh, getR2Keys} from "../api/auth/utils";
import {getCookie} from "hono/cookie";
import {getOauthTokens, setLoginCookies} from "../api/auth/login";
import {
  GRANT_CODE_FLOW,
  CSRF_STATE_KEY,
  GRANT_REFRESH_TOKEN,
  WACS_API_REFRESH_TOKEN,
  WACS_API_TOKEN,
  WACS_USER_TOKEN,
} from "@src/constants";

export const apiV1 = `/api/v1`;
export const transcribeRoute = "/transcribe/";

apiV1Router.use("*", logger());

// This is the only ai route right now and we don't need to register middleware for the auth route itself, but if they had a common prefix, we could group as use (routePrefix, middles)
// check for access Token first
apiV1Router.post(transcribeRoute, async (c, next) => {
  return checkOrRefresh(c, next);
});
apiV1Router.get("checkTest", async (c, next) => {
  return checkOrRefresh(c, next);
});

apiV1Router.get("checkTest", async (c, next) => {
  const jwtPayload = c.get("jwtPayload");
  console.log({jwtPayload});
  console.log("middleware should run first");
  return c.json({jwtPayload});
});

apiV1Router.post(
  `${transcribeRoute}`,
  validator("json", (value) => {
    // throws if invalid
    const parsed = v.safeParse(transcriptionRequestSchema, value);
    if (!parsed.success) {
      console.error("invalid transcription request");
      return new Response(JSON.stringify({error: "Invalid request format"}), {
        status: 400,
        headers: {"Content-Type": "application/json"},
      });
    }
    return parsed.output;
  }),
  async (c) => {
    const jwtPayload = c.get("jwtPayload");
    console.log({jwtPayload});
    const body = c.req.valid("json");

    const bucket = c.env.HTR_STORAGE;
    const repo = new D1TranscriptionRepository(c.env.HTR_DATABASE, new R2ImageRepository(bucket))

    // const jwt = await JSON.parse(jwtPayload);
    // const user = jwt.sub;

    const imageId = self.crypto.randomUUID();

    const bookCode = "gen";
    const languageCode = "en"
    const chapter = 1;

    const htrRes = await HandleTranscriptionRequest(createApiMap(c.env), body);
    const image: TranscriptionImage = {
        id: imageId,
        userId: "user",
        path: `${"images"}/user1/${imageId}`,
        data: "",
        book_code: bookCode,
        language_code: languageCode,
        chapter: chapter,
        verse_start: 0,
        verse_end: 0,
        transcription: [
            {
                human_modified: false,
                prompt: "",
                system_prompt: "",
                date: Date.now(),
                model: "gpt-4o",
                text: [
                    {
                       start_verse: 0,
                       end_verse: 0,
                       text: ""
                    }
                ]
            }
        ]
    }
    await repo.createTranscriptionImage(image)
    return htrRes;
  }
);

apiV1Router.route("/auth", authRouter);

//

function createApiMap(env: Env): Map<TranscriptionModel, string> {
  const keys = new Map<TranscriptionModel, string>();
  keys.set(TranscriptionModel.OPENAI, env.OPENAI_KEY);
  return keys;
}

import { drizzle } from 'drizzle-orm/d1';
import { messages } from "../api/persistence/schema"
import { sql } from 'drizzle-orm';
import { D1TranscriptionRepository } from "./persistence/D1TranscriptionRepository";
import { R2ImageRepository } from "./persistence/R2ImageRepository";
import { TranscriptionImage } from "@src/data/TranscriptionImage";

apiV1Router.get('/initdb', async (c) => {
  try {
    const db = drizzle(c.env.HTR_DATABASE);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT
      );
    `);
    return c.text('Table created');
  } catch (error) {
    console.error(error);
    return c.text(`Error: ${error.message}`, 500);
  }
});

apiV1Router.get('/insert', async (c) => {
  try {
    const db = drizzle(c.env.HTR_DATABASE);
    await db.insert(messages).values({ content: 'Hello, World!' });
    return c.text('Message inserted!');
  } catch (error) {
    console.error(error);
    return c.text(`Error: ${error.message}`, 500);
  }
});

apiV1Router.get('/getdb', async (c) => {
  try {
    const db = drizzle(c.env.HTR_DATABASE);
    const result = await db.select().from(messages);
    if (result.length > 0) {
      return c.json(result);
    } else {
      return c.text('No messages found.');
    }
  } catch (error) {
    console.error(error);
    return c.text(`Error: ${error.message}`, 500);
  }
});

apiV1Router.get('/db', (c) => {
    return c.text('Please use /init, /insert, or /get');
});


export {apiV1Router};