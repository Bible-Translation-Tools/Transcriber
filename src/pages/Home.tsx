import { CSRF_STATE_KEY } from "@src/constants.ts";
import { useEffect, useState } from "react";

function Home() {
	const scopes =
		"openid,email,profile,read:user.read:repository,write:repository";

	const [oauthUrl, setOauthUrl] = useState("");
	async function getOauthUrl() {
		const state = generateOAuthState();
		const { codeVerifier, codeChallenge } = await generatePKCE();
		sessionStorage.setItem("code_verifier", codeVerifier);
		const env = import.meta.env;
		const params = new URLSearchParams();
		params.append("client_id", env.VITE_SSO_CLIENT_ID);
		params.append("redirect_uri", env.VITE_SSO_REDIRECT_URL);
		params.append("response_type", "code");
		params.append("code_challenge_method", "S256");
		params.append("code_challenge", codeChallenge);
		params.append("scope", scopes);
		params.append("state", state);
		const url = `${env.VITE_SSO_BASE_URL}/login/oauth/authorize?${params.toString()}`;
		setOauthUrl(url);
	}

	function generateOAuthState(length = 32): string {
		const existingKey = sessionStorage.getItem(CSRF_STATE_KEY);
		if (existingKey) {
			return existingKey;
		}
		const state = [...crypto.getRandomValues(new Uint8Array(length))]
			.map((b) => b.toString(36).padStart(2, "0"))
			.join("")
			.slice(0, length);
		sessionStorage.setItem(CSRF_STATE_KEY, state);
		return state;
	}

	/**
	 * Generates a PKCE code verifier and its corresponding code challenge
	 * @returns An object containing the code_verifier and code_challenge
	 */
	async function generatePKCE(): Promise<{
		codeVerifier: string;
		codeChallenge: string;
	}> {
		// Generate a random code verifier (43-128 chars)
		const codeVerifier = generateCodeVerifier();

		// Generate the code challenge using S256 method (SHA256 + base64url encoding)
		const codeChallenge = await generateCodeChallenge(codeVerifier);

		return { codeVerifier, codeChallenge };
	}

	/**
	 * Generates a random code verifier string
	 * @returns A random string between 43-128 chars containing allowed characters
	 */
	function generateCodeVerifier(): string {
		// Define allowed characters (alphanumeric + -._~)
		const allowedChars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

		// Generate random length between 43 and 128
		const length = Math.floor(Math.random() * (128 - 43 + 1)) + 43;

		let result = "";
		const randomValues = new Uint8Array(length);
		crypto.getRandomValues(randomValues);

		for (let i = 0; i < length; i++) {
			result += allowedChars.charAt(
				randomValues[i] % allowedChars.length,
			);
		}

		return result;
	}

	/**
	 * Generates a code challenge from a code verifier using S256 method
	 * @param codeVerifier The code verifier to hash
	 * @returns The code challenge (base64url encoded SHA256 hash)
	 */
	async function generateCodeChallenge(
		codeVerifier: string,
	): Promise<string> {
		// Convert the code verifier to an array buffer
		const encoder = new TextEncoder();
		const data = encoder.encode(codeVerifier);

		// Hash the code verifier with SHA256
		const hash = await crypto.subtle.digest("SHA-256", data);

		// Convert the hash to base64url encoding
		return base64UrlEncode(hash);
	}

	/**
	 * Encodes an ArrayBuffer to a base64url string
	 * @param buffer The array buffer to encode
	 * @returns A base64url encoded string
	 */
	function base64UrlEncode(buffer: ArrayBuffer): string {
		// Convert the buffer to a base64 string
		const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

		// Convert base64 to base64url by replacing characters and removing padding
		return base64
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=+$/, "");
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		getOauthUrl();
	}, []);

	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<div className="bg-white p-8 rounded shadow-xl w-96">
				<div className="flex justify-center mb-6">
					{/* <img
                        src=""
                        className="logo"
                        alt="WACS Logo"
                    /> */}
				</div>
				<h2 className="text-2xl font-semibold mb-4">
					Transcriber Login
				</h2>
				<p className="mb-6">
					Please log in using your WA Content Services (WACS) account.
				</p>
				<p className="mb-6">
					Note, if you're already signed in to WACS and you need to
					sign into a different account, you must sign out of your
					current wacs account.
				</p>
				{oauthUrl && (
					<a
						className="login-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex flex-row items-center gap-2 justify-center"
						href={oauthUrl}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 150 150"
							width="32"
							height="32"
						>
							<path fill="#fff" d="M0 0h150v149.481H0z" />
							<path
								fill="#726658"
								d="M66.542 114.481h-17.67L82.791 35h17.67l-33.92 79.481ZM135 35h-17.671l-33.895 79.481h17.67L135 35Z"
							/>
							<path
								fill="#B85659"
								d="M32.647 35H15l33.896 79.481h17.646L32.647 35Z"
							/>
							<path
								fill="#82A93F"
								d="M67.217 35H49.578l33.896 79.481h17.646L67.217 35Z"
							/>
							<path
								fill="#FAA83C"
								d="M100.43 35H82.791l33.896 79.481h17.646L100.43 35Z"
							/>
						</svg>
						Login with WACS
					</a>
				)}
				{!oauthUrl && <div>Loading...</div>}
			</div>
		</div>
	);
}

export default Home;
