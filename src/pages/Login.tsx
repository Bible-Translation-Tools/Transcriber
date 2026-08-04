import {LOGIN_PATH, type LoginReturnType} from "@api/auth/router";
import {ShowWhen} from "@src/components/utils/ShowWhen";
import {TRANSCRIBE_ROUTE} from "@src/constants";
import {refreshProgress} from "@src/domain/ImageActions.ts";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore";
import syncEngine from "@src/services/SyncEngine.ts";
import LogRocket from "logrocket";
import {type FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

function Login() {
	// Programmatic navigation so the first sync can finish before the
	// transcription page mounts and reads the cache.
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | boolean>(false);
	const store = useTranscriptionStore();

	async function login(e: FormEvent<HTMLFormElement>) {
		setErr(false);
		setLoading(true);
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		try {
			const response = await fetch(LOGIN_PATH, {
				method: "POST",
				body: formData,
			});
			if (!response.ok) {
				throw new Error("Network response was not ok", {
					cause: response.statusText,
				});
			}
			const serverData = (await response.json()) as LoginReturnType;
			const { userId, userName, userEmail, error } = serverData;
			if (error) {
				toast.error(error, {
					position: "top-right",
				});
				setErr(error);
				setLoading(false);
				return;
			}

			// Must land before the first sync: every cache read is scoped by it.
			connectUserWithAnalytics(userId, userName, userEmail);

			// Pull the user's images. A browser that has never seen this account
			// starts from cursor 0 and gets everything; a returning one gets only
			// what changed. Image bytes are fetched lazily, as pages are viewed.
			await syncEngine.sync(String(userId));
			await store.refreshProject();
			await refreshProgress(store, String(userId));

			setLoading(false);
			navigate(TRANSCRIBE_ROUTE);
		} catch (e) {
			console.error(e);
			setErr("Could not sign in. Please try again.");
			setLoading(false);
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-100">
				<div className="bg-white p-8 rounded shadow-xl w-96">
					<h2 className="text-2xl font-semibold mb-4">
						Transcriber Login
					</h2>
					Logging in, please wait...
				</div>
			</div>
		);
	}
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
				<p>
					If you do not have an account, you can create one{" "}
					<a
						className="text-blue-600  underline"
						href={`${import.meta.env.VITE_WACS_URL}/user/sign_up`}
					>
						here
					</a>{" "}
					first{" "}
				</p>

				<form
					action={LOGIN_PATH}
					method="POST"
					onSubmit={login}
				>
					<ShowWhen when={!!err}>
						<span className="text-red-500 font-bold"> {err}</span>
					</ShowWhen>
					<input
						type="text"
						placeholder="Username"
						className="w-full p-2 my-2 border rounded"
						name="username"
					/>
					<input
						name="password"
						type="password"
						placeholder="Password"
						className="w-full p-2 my-2 border rounded"
					/>
					<button
						type="submit"
						className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
}

function connectUserWithAnalytics(
	userId: string,
	userName: string,
	userEmail: string,
) {
	LogRocket.identify(userId, {
		name: userName,
		email: userEmail,
	});

	localStorage.setItem("userId", userId);
	localStorage.setItem("userName", userName);
	localStorage.setItem("userEmail", userEmail);
}

export default Login;
