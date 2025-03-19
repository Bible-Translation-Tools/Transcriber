import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();
import { apiV1Router } from "@api/index";

// wK this double declaration is a little odd, but I was thring to keep entrypoint as only registering other branches of routers.I.e auth has several routes maybe:

app.route("/api/v1/", apiV1Router);
app.get("/api/v1/test", (c) => {
    return c.text("works");
});

// fallback to span handling of anything else
app.all("*", (c) => c.env.ASSETS.fetch(c.req.url));

export default app;
