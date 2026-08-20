import { Hono } from "hono";
import { getWacsApiTokenAndUser } from "./login";
import { logout } from "./logout";
import type { HonoBindings } from "./utils";

export const authRouter = new Hono<HonoBindings>();
export const LOGIN_PATH = "/api/v1/auth/login";
export const LOGOUT_PATH = "/api/v1/auth/logout";

// already under api/v1/auth
export type LoginReturnType = {
    userId: string;
    userName: string;
    userEmail: string;
    error: string;
};
authRouter.post("/login", async (ctx) => {
    const body = await ctx.req.formData();
    const username = body.get("username")?.toString();
    const password = body.get("password")?.toString();
    if (!username || !password) {
        return ctx.json({
            error: "missing_credentials",
            userId: null,
        });
    }
    // returning the redirect from fxn is just simpler for keeping the error handling logic inside the fxn here, but allows us to continue on with server sync of images when we do have the token
    const { token, redirectLambda } = await getWacsApiTokenAndUser({
        ctx,
        username,
        password,
    });
    if (!token) {
        return redirectLambda();
    }
    const userId = token.wacsUserId;
    return ctx.json({
        userId,
        userName: token.wacsUsername,
        userEmail: token.wacsUserEmail,
        error: null,
    });
});
authRouter.get("/logout", async (ctx) => {
    return logout({
        ctx,
    });
});
