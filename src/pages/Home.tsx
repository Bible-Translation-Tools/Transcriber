import { LOGIN_PATH } from "@api/auth/router";
import { WacsBasicAuth } from "@src/components/util/WacsBasicAuth";

function Home() {
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
						href={`${import.meta.env.VITE_SSO_BASE_URL}/user/sign_up`}
					>
						here
					</a>{" "}
					first{" "}
				</p>
				<WacsBasicAuth action={"login"} />
			</div>
		</div>
	);
}

export default Home;
