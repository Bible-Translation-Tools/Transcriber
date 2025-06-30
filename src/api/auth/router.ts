import {D1TranscriptionRepository, type UserImageRecord,} from "@api/persistence/D1TranscriptionRepository";
import {R2ImageRepository} from "@api/persistence/R2ImageRepository";
import {Hono} from "hono";
import {getWacsApiTokenAndUser} from "./login";
import {logout} from "./logout";
import type {HonoBindings} from "./utils";

export const authRouter = new Hono<HonoBindings>();
export const LOGIN_PATH = "/api/v1/auth/login";
export const LOGOUT_PATH = "/api/v1/auth/logout";

// already under api/v1/auth
export type LoginReturnType = {
    userId: string;
    userName: string;
    userEmail: string;
    syncData: UserImageRecord;
    error: string;
};
authRouter.post("/login", async (ctx) => {
    const body = await ctx.req.formData();
    const username = body.get("username")?.toString();
    const password = body.get("password")?.toString();
    const indexedDbImgs = body.get("imgIds")?.toString();
    const indexedDbImgIds = JSON.parse(indexedDbImgs ?? "[]") as string[];
    if (!username || !password) {
        return ctx.json({
            error: "missing_credentials",
            syncData: null,
            userId: null,
        });
    }
    // returning the redirect from fxn is just simpler for keeping the error handling logic inside the fxn here, but allows us to continue on with server sync of images when we do have the token
    const {token, redirectLambda} = await getWacsApiTokenAndUser({
        ctx,
        username,
        password,
    });
    if (!token) {
        return redirectLambda();
    }
    const userId = token.wacsUserId;
    const d1Repo = new D1TranscriptionRepository(
        ctx.env.HTR_DATABASE,
        new R2ImageRepository(ctx.env.HTR_STORAGE),
    );
    const syncData = await d1Repo.getAllImagesForUser({
        userId: String(userId),
        indexedDbImgIds,
    });
    return ctx.json({
        userId,
        userName: token.wacsUsername,
        userEmail: token.wacsUserEmail,
        syncData,
        error: null,
    });
});
authRouter.get("/logout", async (ctx) => {
    return logout({
        ctx,
    });
});
