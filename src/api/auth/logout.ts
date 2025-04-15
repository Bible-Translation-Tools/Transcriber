import {
	WACS_API_REFRESH_TOKEN,
	WACS_API_TOKEN,
	WACS_USER,
} from "@src/constants";
import type { Context } from "hono";
import { deleteCookie } from "hono/cookie";
export function logout(ctx: Context) {
	[WACS_API_TOKEN, WACS_API_REFRESH_TOKEN, WACS_USER].forEach((cookie) => {
		deleteCookie(ctx, cookie);
	});
	return ctx.redirect("/");
}
