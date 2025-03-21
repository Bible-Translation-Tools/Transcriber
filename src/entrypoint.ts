import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();
import { apiV1Router, transcribeRoute } from "@api/index";
import { checkOrRefresh } from "@api/auth/utils";

// wK this double declaration is a little odd, but I was thring to keep entrypoint as only registering other branches of routers.I.e auth has several routes maybe:

app.route("/api/v1/", apiV1Router);
app.get("/api/v1/test", (c) => {
    return c.text("works");
});

app.get("/welcome", async (c, next) => {
    return await checkOrRefresh(c, next);
});

//redirect if auth, othwerise defer to welcome page
app.get("/welcome", async (c) => {
    const jwtPayload = c.get("jwtPayload");
    if (jwtPayload) {
      return c.redirect(transcribeRoute);
    }
    return c.env.ASSETS.fetch(c.req.url);
  });
   
// fallback to span handling of anything else
app.all("*", (c) => c.env.ASSETS.fetch(c.req.url));

export default app;
