import {Hono} from "hono";
import {getSsoResponse} from "@api/auth/login";

export const authRouter = new Hono<{Bindings: Env}>();
export const LOGIN_PATH = "/api/v1/auth/login";

// already under api/v1/auth
authRouter.get("/login", async (ctx) => {
  return getSsoResponse({
    ctx,
    grantType: "authorization_code",
  });
});
