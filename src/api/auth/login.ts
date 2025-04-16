import { transcribeRoute, WACS_API_TOKEN } from "@src/constants";
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
		const wacsUrl = `${ctx.env.SSO_BASE_URL}/api/v1/users/${username}/tokens`;
		const b64Creds = btoa(`${username}:${password}`);
		const res = await fetch(wacsUrl, {
			method: "POST",
			headers: {
				authorization: `Basic ${b64Creds}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				name: `transcriber api token ${Date.now()}`,
				scopes: ["write:repository", "write:user"],
			}),
		});
		if (!res.ok) {
			throw new Error("failed to get wacs api token");
		}
		const token = (await res.json()) as TokenRes;
		console.log("token", token);
		const userEndpoint = `${ctx.env.SSO_BASE_URL}/api/v1/user`;
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
		return ctx.redirect(`${transcribeRoute}?username=${username}`);
	} catch (e) {
		console.error(e);
		return ctx.redirect("/?error=login_failed");
	}
}
