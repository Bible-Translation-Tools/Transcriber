import { Hono } from "hono";
import { logout } from "./logout";
import { getWacsApiTokenAndUser } from "./login";
import type { HonoBindings } from "./utils";

export const authRouter = new Hono<HonoBindings>();
export const LOGIN_PATH = "/api/v1/auth/login";
export const LOGOUT_PATH = "/api/v1/auth/logout";

// already under api/v1/auth
authRouter.post("/login", async (ctx) => {
	const body = await ctx.req.formData();
	const username = body.get("username")?.toString();
	const password = body.get("password")?.toString();
	if (!username || !password) {
		return ctx.redirect("/?error=missing_credentials");
	}
	return getWacsApiTokenAndUser({
		ctx,
		username,
		password,
	});
});
authRouter.post("/logout", async (ctx) => {
	const body = await ctx.req.formData();
	const username = body.get("username")?.toString();
	const password = body.get("password")?.toString();
	if (!username || !password) {
		return ctx.redirect("/?error=missing_credentials");
	}
	return logout({
		ctx,
		username,
		password,
	});
});
