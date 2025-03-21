// check for access token. If not present, try refresh and next. Add tokens to the req  If fails, redirect to Home.

import { setLoginCookies } from "@api/auth/login";
import {
    CACHED_JWKS_KEY,
    GRANT_REFRESH_TOKEN,
    R2_JWKS_SYNC_SECONDS,
    WACS_API_REFRESH_TOKEN,
    WACS_API_TOKEN,
    WACS_USER_TOKEN,
} from "@src/constants";
import type { Context, Next } from "hono";
import { some } from "hono/combine";
import { getCookie } from "hono/cookie";
import { jwk } from "hono/jwk";
import { decode } from "hono/jwt";
import type { HonoJsonWebKey } from "hono/utils/jwt/jws";
import * as v from "valibot";
import { getOauthTokens } from "./login";

// fetch the jwks uri and sync;
const JwkKeySchema = v.object({
    alg: v.string(),
    e: v.string(),
    kid: v.string(),
    kty: v.string(),
    n: v.string(),
    use: v.string(),
});
const jwksResponseSchema = v.object({
    keys: v.array(JwkKeySchema),
});
type JwkSchemaType = v.InferOutput<typeof JwkKeySchema>;

export async function checkAccessToken(
    ctx: Context<{ Bindings: Env }>,
    next: Next,
) {
    const check = jwk({
        cookie: WACS_USER_TOKEN,
        jwks_uri: `${ctx.env.SSO_BASE_URL}/login/oauth/keys`,
        keys: await getR2Keys(ctx),
    });
    await check(ctx, next);
}

export async function getRefreshTokenMw(ctx: Context, next: Next) {
    const refreshCookie = getCookie(ctx, WACS_API_REFRESH_TOKEN);
    // no refresh cookie and no auth token = redirect. Login again
    console.log("no refresh or access cookie, redirecting. ");
    if (!refreshCookie) return await next();
    // get new token useing refresh token
    const data = await getOauthTokens({
        env: ctx.env,
        code: ctx.req.query("code") as string,
        request: ctx.req.raw,
        grantType: GRANT_REFRESH_TOKEN,
        refreshToken: refreshCookie,
    });
    console.error("err refreshing tokens", data);
    if (data.type === "error") {
        ctx.set("refreshError", data.error);
        return await next();
    }
    setLoginCookies({
        accessToken: data.accessToken,
        accessExpires: data.accessExpires,
        ctx,
        idToken: data.idToken,
        refresh: data.refresh,
    });
    // no need to verify, we just fetched it
    const decoded = decode(data.idToken);
    console.log("setting jwt payload", decoded);
    ctx.set("jwtPayload", decoded);
    await next();
}

export const checkOrRefresh = some(checkAccessToken, getRefreshTokenMw);

// stub for for fetching cached r2 keys
export async function getR2Keys(ctx: Context<{ Bindings: Env }>) {
    const stringifiedKeys = await ctx.env.TRANSCRIBER_KV.get(CACHED_JWKS_KEY);
    return stringifiedKeys
        ? (JSON.parse(stringifiedKeys) as JwkSchemaType[])
        : [];
}

export async function syncR2Keys(ctx: Context<{ Bindings: Env }>, next: Next) {
    console.log(`calling syncR2Keys, ${ctx.req.url}`);
    // this is a non response blocking middlware
    async function fetchKeys() {
        try {
            // we can just check the presence of the key since the expirationTtl is set below to the const
            const lastVal =
                await ctx.env.TRANSCRIBER_KV.getWithMetadata(CACHED_JWKS_KEY);
            if (lastVal) {
                // console.log(`last cached was ${JSON.stringify(lastVal)}`);
                return;
            }
            const jwksUri = `${ctx.env.SSO_BASE_URL}/login/oauth/keys`;
            const res = await fetch(jwksUri);
            if (res.ok) {
                const data = await res.json();
                const parsed = v.parse(jwksResponseSchema, data);
                await ctx.env.TRANSCRIBER_KV.put(
                    CACHED_JWKS_KEY,
                    JSON.stringify(parsed.keys),
                    {
                        // expirationTtl: after this time, the key (and thus its value) will be gone forever
                        expirationTtl: R2_JWKS_SYNC_SECONDS,
                        metadata: {
                            timeCached: Date.now().toString(),
                        },
                    },
                );
                console.log(`done syncing syncR2Keys, ${ctx.req.url}`);
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }
    // A cron would be a little more sophisticated than refreshing jwks each response, but after this is cached once, it'll check these first on incoming auth requests and then refresh the cached kv store for next req.Ideally the jwks middleware would let you tap into it's response to cache it, but it doesn't right now. I.e. //https://github.com/orgs/honojs/discussions/3983
    await next();
    return ctx.executionCtx.waitUntil(fetchKeys());

    // continue on middleware, non blocking
}

// api token explicitly used for writing back to wacs. the id token wouldn't work.  Can be adapted to be a middlweare or just to get them.  The refresh flow above sets all new cookies when needed, so can just call a a jwk
export async function getWacsApiToken(ctx: Context) {
    // We shouldn't worry about verifying the wacs token.  If we submit an api request and it's invalid, the api will let us know, and the middleware to get identitiy token should be sufficient to keep both access and api tokens flowing since they have the same max age.  There is the option to call jwk as a middlware for this too, but we don't really want to fetch the jwks url, we don't need to overwrite the jwtPayload
    const cookie = getCookie(ctx, WACS_API_TOKEN);
    if (!cookie) return null;
    return cookie; //no need to decode. This is used for api requests Id info is on the user cookie
}
