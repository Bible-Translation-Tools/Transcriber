import { LOGIN_PATH } from "@api/auth/router";
import { CSRF_STATE_KEY } from "@src/constants";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
	const navigate = useNavigate();

	const handleLogin = useCallback(async () => {
		const searchParams = new URLSearchParams(window.location.search);
		const code = searchParams.get("code");
		const state = searchParams.get("state");

		// Verify state
		const storedState = localStorage.getItem(CSRF_STATE_KEY);
		if (!state || !storedState || state !== storedState) {
			// Invalid state, redirect back to home
			navigate("/");
			localStorage.removeItem(CSRF_STATE_KEY);
			return;
		}

		// If code is present, redirect to API endpoint
		if (code) {
			const response = await fetch(
				`${LOGIN_PATH}?code=${encodeURIComponent(code)}`,
			);
			if (response.ok) {
				navigate("/transcriber");
			}
		} else {
			// No code received, redirect back to home
			navigate("/?auth=missing");
		}

		// Clean up state after use
		localStorage.removeItem(CSRF_STATE_KEY);
	}, [navigate]); // `navigate` is the only external dependency

	useEffect(() => {
		handleLogin();
	}, [handleLogin]);

	// This is a headless component, no render output
	return null;
}

export default Login;
