import type { HonoBindings, WacsTokenAndUser } from "@api/auth/utils";
import { Hono } from "hono";
import { apiV1Router } from "./api";
import { getRouterName, showRoutes } from "hono/dev";
import { except } from "hono/combine";
import { getCookie } from "hono/cookie";
import { WACS_API_TOKEN } from "./constants";
import { logger } from "hono/logger";

const app = new Hono<HonoBindings>();
app.use("*", logger());

// wK this double declaration is a little odd, but I was thring to keep entrypoint as only registering other branches of routers.I.e auth has several routes maybe:
// todo: excep the login route from this of course
app.use(
	"*",
	except("/api/v1/auth/login", async (c, next) => {
		const apiToken = getCookie(c, WACS_API_TOKEN);
		if (!apiToken) {
			return c.redirect("/");
		}
		try {
			const parsed = JSON.parse(apiToken) as WacsTokenAndUser;
			c.set("user", parsed);
		} catch (e) {
			let message = "Unknown Error";
			if (e instanceof Error) message = e.message;
			return c.redirect(`/?error=${message}`);
		}
		await next();
	}),
);
app.route("/api/v1/", apiV1Router);

// fallback to span handling of anything else
app.all("*", (c) => c.env.ASSETS.fetch(c.req.url));

export default app;
