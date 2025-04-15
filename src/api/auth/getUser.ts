type getUserArgs = {
	bearerToken: string;
	SSO_BASE_URL: string;
};
export async function getUser({
	bearerToken,
	SSO_BASE_URL,
}: getUserArgs): Promise<UserGitea | undefined> {
	try {
		const url = `${SSO_BASE_URL}/api/v1/user`;
		const response = await fetch(url, {
			headers: {
				Authorization: `token ${bearerToken}`,
				"Content-Type": "application/json",
			},
		});
		const data = (await response.json()) as UserGitea;
		return {
			id: data.id,
			login: data.login,
			email: data.email,
			avatar_url: data.avatar_url,
			html_url: data.html_url,
			language: data.language,
		} as UserGitea;
	} catch (error) {
		console.error(error);
	}
}
export type UserGitea = {
	id: number;
	login: string;
	email: string;
	avatar_url: string;
	html_url: string;
	language: string;
};
