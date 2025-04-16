import { LOGIN_PATH, LOGOUT_PATH } from "@api/auth/router";

export function WacsBasicAuth({ action }: { action: "login" | "logout" }) {
	return (
		<form
			action={action === "login" ? LOGIN_PATH : LOGOUT_PATH}
			method="POST"
		>
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
				{action === "login" ? "Login" : "Logout"}
			</button>
		</form>
	);
}
