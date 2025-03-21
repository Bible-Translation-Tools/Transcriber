import { CSRF_STATE_KEY } from "@src/constants";

function Introduction() {
	const scopes = encodeURIComponent(
		"openid email profile read:user read:repository write:repository",
	);
	function generateOAuthState(length = 32): string {
		const state = [...crypto.getRandomValues(new Uint8Array(length))]
			.map((b) => b.toString(36).padStart(2, "0"))
			.join("")
			.slice(0, length);
		localStorage.setItem(CSRF_STATE_KEY, state);
		return state;
	}
	return (
		<div className="flex flex-col items-center gap-2">
			{/* Centered content */}
			<div
				style={{
					textAlign: "center",
					color: "#0F2F4C",
					fontSize: "44.05px",
					fontFamily: "Noto Sans",
					fontWeight: "500",
					lineHeight: "50.66px",
				}}
			>
				Add some photos to get started.
			</div>
			<div
				style={{
					textAlign: "center",
					color: "#516B86",
					fontSize: "20px",
					fontFamily: "Noto Sans",
					fontWeight: "400",
					lineHeight: "40px",
				}}
			>
				This tool converts handwritten documents into a digital format.
				While it can be very reliable, we recommend you review your
				results.
				<div>
					You must login{" "}
					<a
						className="underline text-blue-500"
						href={`${
							import.meta.env.VITE_SSO_BASE_URL
						}/login/oauth/authorize?client_id=${
							import.meta.env.VITE_SSO_CLIENT_ID
						}&redirect_uri=${
							import.meta.env.VITE_SSO_REDIRECT_URL
						}&response_type=code&scope=${scopes}&state=${generateOAuthState()}`}
					>
						here
					</a>{" "}
					to get started
				</div>
			</div>
		</div>
	);
}

export default Introduction;
