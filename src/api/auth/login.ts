import {
    GRANT_CODE_FLOW,
    GRANT_REFRESH_TOKEN,
    WACS_API_REFRESH_TOKEN,
    WACS_API_TOKEN,
    WACS_USER_TOKEN,
} from "@src/constants";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";

type GetSsoResponseArgs = {
    ctx: Context;
    grantType?: string;
    refreshToken?: string;
};
type TokenArgs = {
    request: Request;
    code: string;
    env: Env;
    grantType?: string;
    refreshToken?: string;
};
type TokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    id_token: string;
};

type ErrorResponse = {
    type: "error";
    error: string;
    status: number;
};

type SuccessResponse = {
    type: "ok";
    accessToken: string;
    accessExpires: number;
    refresh: string;
    idToken: string;
};

type ApiResponse = ErrorResponse | SuccessResponse;

export async function getSsoResponse({
    ctx,
    grantType = "authorization_code",
    refreshToken,
}: GetSsoResponseArgs): Promise<Response> {
    const request = ctx.req.raw;
    const code = ctx.req.query("code") as string; //we return err below if not present
    const env = ctx.env;
    const oauthResponse = await getOauthTokens({
        request,
        code,
        env,
        grantType,
        refreshToken,
    });
    if (oauthResponse.type === "error") {
        return new Response(JSON.stringify(oauthResponse.error), {
            status: oauthResponse.status,
        });
    }
    setLoginCookies({
        accessToken: oauthResponse.accessToken,
        accessExpires: oauthResponse.accessExpires,
        ctx,
        idToken: oauthResponse.idToken,
        refresh: oauthResponse.refresh,
    });
    // todo: should probably be more consistnet with ctx responses and new Response. ctx isn't that large of a wrapper around a web standard request and response object.  But if you use stuff like ctx.setCookies you need to send a res through ctx.
    return ctx.json({ success: true });
    // return new Response(JSON.stringify({success: true}), {
    //   status: 200,
    //   // headers: oauthResponse.headers,
    // });
}

type SetCookieArgs = {
    accessToken: string;
    accessExpires: number;
    refresh: string;
    idToken: string;
    ctx: Context;
};

export async function setLoginCookies({
    accessExpires,
    accessToken,
    ctx,
    idToken,
    refresh,
}: SetCookieArgs) {
    setCookie(ctx, WACS_API_TOKEN, accessToken, {
        path: "/",
        secure: true,
        httpOnly: true,
        maxAge: accessExpires,
        sameSite: "lax",
    });
    setCookie(ctx, WACS_API_REFRESH_TOKEN, refresh, {
        path: "/",
        secure: true,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
    });
    setCookie(ctx, WACS_USER_TOKEN, idToken, {
        path: "/",
        secure: true,
        httpOnly: true,
        maxAge: accessExpires, //same as access token to wacs
        sameSite: "lax",
    });
}

export async function getOauthTokens({
    request,
    code,
    env,
    grantType = "authorization_code",
    refreshToken,
}: TokenArgs): Promise<ApiResponse> {
    const CLIENT_ID = env.SSO_CLIENT_ID;
    const CLIENT_SECRET = env.SSO_CLIENT_SECRET;
    const redirectUrl = new URL(request.url);
    const REDIRECT_PATH = env.SSO_REDIRECT_PATH;
    const SSO_BASE_URL = env.SSO_BASE_URL;
    if (!code && grantType === GRANT_CODE_FLOW) {
        return {
            type: "error",
            error: "Missing code parameter",
            status: 400,
        };
    }
    if (!refreshToken && grantType === GRANT_REFRESH_TOKEN) {
        return {
            type: "error",
            error: "Missing refresh token",
            status: 400,
        };
    }
    const requestBody: Record<string, string> = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: `${redirectUrl.origin}${REDIRECT_PATH}`,
    };
    if (grantType === GRANT_CODE_FLOW) {
        requestBody.code = code as string; //validated above
        requestBody.grant_type = grantType;
    } else {
        requestBody.grant_type = grantType;
        requestBody.refresh_token = refreshToken as string; //validated above
    }
    try {
        const authUrl = `${SSO_BASE_URL}/login/oauth/access_token`;
        const response = await fetch(authUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            return {
                type: "error",
                error: "fetch for token failed",
                status: 400,
            };
        }
        const data = (await response.json()) as TokenResponse;
        // todo: should validate not assert shape of tokenData
        // console.log(data);
        return {
            type: "ok",
            accessToken: data.access_token,
            accessExpires: data.expires_in,
            refresh: data.refresh_token,
            idToken: data.id_token,
        };
    } catch (error) {
        console.error(error);
        return {
            type: "error",
            error: "Internal server error during OAuth flow",
            status: 500,
        };
    }
}
