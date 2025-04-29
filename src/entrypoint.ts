import type { HonoBindings, WacsTokenAndUser } from "@api/auth/utils";
import { Hono } from "hono";
import { except } from "hono/combine";
import { getCookie } from "hono/cookie";
import { logger } from "hono/logger";
import { apiV1Router } from "./api";
import { TRANSCRIBE_ROUTE, WACS_API_TOKEN } from "./constants";

const app = new Hono<HonoBindings>();
app.use("*", logger());

app.get("/login", async (c, next) => {
	const apiToken = getCookie(c, WACS_API_TOKEN);
	console.log({ apiToken });
	if (apiToken) {
		return c.redirect(TRANSCRIBE_ROUTE);
	}
	await next();
});
app.use(
	"*",
	// no need for user on login or logout
	except(["/api/v1/auth/*", "/login"], async (c, next) => {
		const apiToken = getCookie(c, WACS_API_TOKEN);
		if (!apiToken) {
			return c.redirect("/login");
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
