import { WACS_API_TOKEN } from "@src/constants";
import { deleteCookie } from "hono/cookie";
import type { CfHonoBindings } from "./utils";

type getWacsApiTokenArgs = {
	ctx: CfHonoBindings;
	username: string;
	password: string;
};

export async function logout({ ctx, username, password }: getWacsApiTokenArgs) {
	const token = ctx.get("user");
	try {
		const tokenDelEndpoint = `${ctx.env.SSO_BASE_URL}/api/v1/users/${token.wacsUsername}/tokens/${token.tokenId}`;
		const b64Creds = btoa(`${username}:${password}`);
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
		console.log("cleared cookie");
		deleteCookie(ctx, WACS_API_TOKEN);
		return ctx.redirect("/?logout=success");
	} catch (e) {
		let message = "Unknown Error";
		if (e instanceof Error) message = e.message;
		return ctx.redirect(`/?error=${message}`);
	}
	// delete from Wacs:
}
