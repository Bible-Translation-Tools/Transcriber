import { WACS_API_TOKEN } from "@src/constants";
import { deleteCookie } from "hono/cookie";
import type { CfHonoBindings } from "./utils";

type getWacsApiTokenArgs = {
	ctx: CfHonoBindings;
};

export async function logout({ ctx }: getWacsApiTokenArgs) {
	try {
		deleteCookie(ctx, WACS_API_TOKEN);
		return ctx.redirect("/login?logout=success");
	} catch (e) {
		let message = "Unknown Error";
		if (e instanceof Error) message = e.message;
		return ctx.redirect(`/?error=${message}`);
	}
	// delete from Wacs:
}
