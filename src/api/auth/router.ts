import { getSsoResponse } from "@api/auth/login";
import { Hono } from "hono";
import { logout } from "./logout";

export const authRouter = new Hono<{ Bindings: Env }>();
export const LOGIN_PATH = "/api/v1/auth/login";

// already under api/v1/auth
authRouter.get("/login", async (ctx) => {
  return getSsoResponse({
    ctx,
    grantType: "authorization_code",
  });
});
authRouter.get("/logout", (ctx) => {
  return logout(ctx);
});
