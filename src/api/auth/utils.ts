import type { Context } from "hono";

export type HonoBindings = {
	Bindings: Env;
	Variables: { user: WacsTokenAndUser };
};
export type CfHonoBindings = Context<HonoBindings>;

export type TokenRes = {
	id: number;
	name: string;
	sha1: string;
	token_last_eight: string;
	scopes: Array<string>;
};
export type UserRes = {
	id: number;
	login: string;
	email: string;
	avatar_url: string;
	html_url: string;
	language: string;
	username: string;
};

export type WacsTokenAndUser = {
	tokenId: number;
	tokenName: string;
	tokenSha1: string;
	tokenLastEight: string;
	tokenScopes: Array<string>;
	wacsUserId: number;
	wacsLogin: string;
	wacsUserEmail: string;
	wacsUserAvatarUrl: string;
	wacsUserHtmlUrl: string;
	wacsUserLanguage: string;
	wacsUsername: string;
};
