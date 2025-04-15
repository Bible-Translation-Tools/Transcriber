import { Hono } from "hono";
const app = new Hono<{
	Bindings: Env;
	Variables: {
		user: string;
	};
}>();
import { checkOrRefresh } from "@api/auth/utils";
import { apiV1Router, transcribeRoute } from "@api/index";
import { logger } from "hono/logger";
import { getCookie } from "hono/cookie";
import { WACS_USER } from "@src/constants";

// wK this double declaration is a little odd, but I was thring to keep entrypoint as only registering other branches of routers.I.e auth has several routes maybe:
app.use("*", logger());
app.use("*", async (c, next) => {
	const userCookie = getCookie(c, WACS_USER);
	const user = userCookie ? JSON.parse(userCookie) : null;
	c.set("user", user);
	return await next();
});

app.route("/api/v1/", apiV1Router);

app.get("/welcome", async (c, next) => {
	return await checkOrRefresh(c, next);
});

//redirect if auth, othwerise defer to welcome page
app.get("/welcome", async (c) => {
	const user = c.get("user");
	console.log({ route: "welcome", user });
	if (user) {
		return c.redirect(transcribeRoute);
	}
	return c.env.ASSETS.fetch(c.req.url);
});

// fallback to span handling of anything else
app.all("*", (c) => c.env.ASSETS.fetch(c.req.url));

export default app;
