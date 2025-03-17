// check for access token. If not present, try refresh and next. Add tokens to the req  If fails, redirect to Home.

import {
  GRANT_REFRESH_TOKEN,
  WACS_API_REFRESH_TOKEN,
  WACS_API_TOKEN,
  WACS_USER_TOKEN,
} from "@src/constants";
import {Context, Next} from "hono";
import {getCookie} from "hono/cookie";
import {jwk} from "hono/jwk";
import {getOauthTokens} from "./login";
import {setLoginCookies} from "@api/auth/login";
import {decode} from "hono/jwt";
import {some} from "hono/combine";

// export async function checkAndRefreshAuth(ctx: Context, next: Next) {
//   const one = jwk({
//     jwks_uri: "/",
//   });
//   const l = await one(ctx, next);
// }
export async function checkAccessToken(ctx: Context, next: Next) {
  const check = jwk({
    cookie: WACS_USER_TOKEN,
    jwks_uri: `${ctx.env.SSO_BASE_URL}/login/oauth/keys`,
    keys: await getR2Keys(),
  });
  return check(ctx, next);
}
export async function getRefreshTokenMw(ctx: Context, next: Next) {
  const refreshCookie = getCookie(ctx, WACS_API_REFRESH_TOKEN);
  // no refresh cookie and no auth token = redirect
  console.log("no refresh or access cookie, redirecting");
  if (!refreshCookie) {
    return ctx.redirect(`/?auth=missing`);
  }
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
    return ctx.redirect(`/?auth=err`);
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
  return next();
}
export const checkOrRefresh = some(checkAccessToken, getRefreshTokenMw);

// stub for for fetching cached r2 keys
export async function getR2Keys() {
  return [];
}
// fetch the jwks uri and sync;
export async function syncR2Keys() {}

// api token explicitly used for writing back to wacs. the id token wouldn't work.  Can be adapted to be a middlweare or just to get them.  The refresh flow above sets all new cookies when needed, so can just call a a jwk
export async function getWacsApiToken(ctx: Context, next: Next) {
  // We shouldn't worry about verifying the wacs token.  If we submit an api request and it's invalid, the api will let us know, and the mw to get identitiy token should be sufficient to keep new tokens flowing.  There is the option to call jwk as a middlware for this too, but this token does have an exp, and if you use jwk twic in same path, it'd rewrite teh context objec of jtwPayload
  const cookie = getCookie(ctx, WACS_API_TOKEN);
  if (!cookie) return null;
  return cookie; //no need to decode. This is used for api requests Id info is on the user cookie
}
