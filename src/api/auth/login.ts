import { WACS_API_TOKEN } from "@src/constants";
import { setCookie } from "hono/cookie";

import type {
	CfHonoBindings,
	TokenRes,
	UserRes,
	WacsTokenAndUser,
} from "./utils";

type getWacsApiTokenArgs = {
	ctx: CfHonoBindings;
	username: string;
	password: string;
};

export async function getWacsApiTokenAndUser({
	ctx,
	username,
	password,
}: getWacsApiTokenArgs) {
	try {
		const wacsUrl = `${ctx.env.WACS_URL}/api/v1/users/${username}/tokens`;
		const b64Creds = btoa(`${username}:${password}`);
		const res = await fetch(wacsUrl, {
			method: "POST",
			headers: {
				authorization: `Basic ${b64Creds}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				name: `transcriber-api-token_${Date.now()}`,
				scopes: ["write:repository", "write:user"],
			}),
		});
		if (!res.ok) {
			throw new Error("failed to get wacs api token");
		}
		const token = (await res.json()) as TokenRes;
		console.log("token", token);
		const userEndpoint = `${ctx.env.WACS_URL}/api/v1/user`;
		const apiToken = token.sha1;
		const userRes = await fetch(userEndpoint, {
			headers: {
				Authorization: `token ${apiToken}`,
				Accept: "application/json",
			},
		});
		if (!userRes.ok) {
			console.log(userRes);
			const body = await userRes.text();
			console.log(body);
			throw new Error("failed to get user info");
		}
		const userData = (await userRes.json()) as UserRes;
		const mergedDataAsCookie: WacsTokenAndUser = {
			tokenId: token.id,
			tokenName: token.name,
			tokenSha1: token.sha1,
			tokenLastEight: token.token_last_eight,
			tokenScopes: token.scopes,
			wacsUserId: userData.id,
			wacsLogin: userData.login,
			wacsUserEmail: userData.email,
			wacsUserAvatarUrl: userData.avatar_url,
			wacsUserHtmlUrl: userData.html_url,
			wacsUserLanguage: userData.language,
			wacsUsername: userData.username,
		};
		setCookie(ctx, WACS_API_TOKEN, JSON.stringify(mergedDataAsCookie), {
			httpOnly: true,
			sameSite: "Strict", //only send on same site
			secure: true, //https only. localhost is trusted by default
		});
		// ctx.waitUntil() extends the lifetime of your Worker, allowing you to perform work without blocking returning a response, and that may continue after a response is returned. It accepts a Promise, which the Workers runtime will continue executing, even after a response has been returned by the Worker's handler.
		// No need to wait to return response while just clearing token creep in background;
		ctx.executionCtx.waitUntil(
			clearOldTokens({
				baseUrl: ctx.env.WACS_URL,
				b64Creds,
				tokenIdJustCreated: token.id,
				username,
			}),
		);
		return { token: mergedDataAsCookie, redirectLambda: null };
	} catch (e) {
		console.error(e);
		return {
			token: null,
			redirectLambda: () =>
				ctx.json({
					error: "login_failed",
					syncData: null,
					userId: null,
				}),
		};
	}
}

type ClearOldTokenArgs = {
	baseUrl: string;
	b64Creds: string;
	username: string;
	tokenIdJustCreated: number;
};
async function clearOldTokens({
	baseUrl,
	b64Creds,
	tokenIdJustCreated,
	username,
}: ClearOldTokenArgs) {
	// Note that /users/:name/tokens is a special endpoint and requires you to authenticate using BasicAuth
	try {
		// 174543213386
		const existingTokenUrl = `${baseUrl}/api/v1/users/${username}/tokens`;
		const res = await fetch(existingTokenUrl, {
			method: "GET",
			headers: {
				authorization: `Basic ${b64Creds}`,
				"content-type": "application/json",
			},
		});
		if (!res.ok) {
			throw new Error("failed to get wacs api token");
		}
		const existingTokens = (await res.json()) as TokenRes[];
		for (const token of existingTokens) {
			const matchesPattern = token.name.startsWith(
				"transcriber-api-token_",
			);
			if (matchesPattern && token.id !== tokenIdJustCreated) {
				// delete any old transcriber tokens
				try {
					const tokenDelEndpoint = `${baseUrl}/api/v1/users/${username}/tokens/${token.id}`;
					const tokenDelRes = await fetch(tokenDelEndpoint, {
						method: "DELETE",
						headers: {
							authorization: `Basic ${b64Creds}`,
							"Content-Type": "application/json",
						},
					});
					if (!tokenDelRes.ok) {
						console.error(tokenDelRes);
						throw new Error("failed to delete wacs api token");
					}
					console.log(`Deleted token name: ${token.name}`);
				} catch (error) {
					console.error(error);
				}
			}
		}
	} catch (error) {
		console.error(error);
	}
}
