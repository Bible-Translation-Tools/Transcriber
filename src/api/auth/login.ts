import {
	GRANT_CODE_FLOW,
	GRANT_REFRESH_TOKEN,
	WACS_API_REFRESH_TOKEN,
	WACS_API_TOKEN,
	WACS_USER,
} from "@src/constants";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { getUser, type UserGitea } from "./getUser";

type GetSsoResponseArgs = {
	ctx: Context;
	grantType?: string;
	refreshToken?: string;
};
type TokenArgs = {
	request: Request;
	code: string;
	codeVerifier: string;
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
	user: UserGitea;
	refresh: string;
};

type ApiResponse = ErrorResponse | SuccessResponse;

export async function getSsoResponse({
	ctx,
	grantType = "authorization_code",
	refreshToken,
}: GetSsoResponseArgs): Promise<Response> {
	const request = ctx.req.raw;
	const code = ctx.req.query("code") as string; //we return err below if not present
	const codeVerifier = ctx.req.query("codeVerifier") as string;
	const env = ctx.env;
	const oauthResponse = await getOauthTokens({
		request,
		code,
		codeVerifier,
		env,
		grantType,
		refreshToken,
	});
	if (oauthResponse.type === "error") {
		return new Response(JSON.stringify(oauthResponse.error), {
			status: oauthResponse.status,
		});
	}
	// no Id token with pkce: fetch from api and save
	const user = await getUser({
		bearerToken: oauthResponse.accessToken,
		SSO_BASE_URL: env.SSO_BASE_URL,
	});
	if (!user) {
		throw new Error("Failed to fetch user data");
	}
	setLoginCookies({
		accessToken: oauthResponse.accessToken,
		accessExpires: oauthResponse.accessExpires,
		ctx,
		user: user,
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
	user: UserGitea;
	ctx: Context;
};

export async function setLoginCookies({
	accessExpires,
	accessToken,
	ctx,
	refresh,
	user,
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
	// todo: rename this cookie?
	setCookie(ctx, WACS_USER, JSON.stringify(user), {
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
	codeVerifier,
	env,
	grantType = "authorization_code",
	refreshToken,
}: TokenArgs): Promise<ApiResponse> {
	const CLIENT_ID = env.SSO_CLIENT_ID;
	const CLIENT_SECRET = env.SSO_CLIENT_SECRET;
	const redirectUrl = new URL(request.url);
	const REDIRECT_PATH = env.SSO_REDIRECT_PATH;
	const SSO_BASE_URL = env.SSO_BASE_URL;
	if ((!code || !codeVerifier) && grantType === GRANT_CODE_FLOW) {
		console.error("Missing code  or code verifier for code flow");
		return {
			type: "error",
			error: "Missing code parameter",
			status: 400,
		};
	}
	if (!refreshToken && grantType === GRANT_REFRESH_TOKEN) {
		console.error("Missing refresh token for refresh flow");
		return {
			type: "error",
			error: "Missing refresh token",
			status: 400,
		};
	}
	const requestBody: Record<string, string> = {
		client_id: CLIENT_ID,
		redirect_uri: `${redirectUrl.origin}${REDIRECT_PATH}`,
	};
	if (grantType === GRANT_CODE_FLOW) {
		requestBody.code = code as string; //validated above
		requestBody.grant_type = grantType;
		requestBody.code_verifier = codeVerifier; //pkce forces reauth
	} else {
		// refresh token flow
		requestBody.grant_type = grantType;
		requestBody.refresh_token = refreshToken as string; //validated above
		requestBody.client_secret = CLIENT_SECRET;
	}
	try {
		const authUrl = `${SSO_BASE_URL}/login/oauth/access_token`;
		console.log({ requestBody });
		const response = await fetch(authUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		const body = response.body;
		console.log("fn: getOauthTokens: body is ", body);
		const data = (await response.json()) as TokenResponse;
		if (!response.ok) {
			console.log({
				oauthFetchResponse: response,
				data,
			});
			return {
				type: "error",
				error: "fetch for token failed",
				status: 400,
			};
		}
		// todo: should validate not assert shape of tokenData
		console.log({ oauthData: data });
		const user = await getUser({
			bearerToken: data.access_token,
			SSO_BASE_URL,
		});
		if (!user) {
			throw new Error("user not found");
		}
		return {
			type: "ok",
			accessToken: data.access_token,
			accessExpires: data.expires_in,
			refresh: data.refresh_token,
			user: user,
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
