import {LOGIN_PATH, type LoginReturnType} from "@api/auth/router";
import {ShowWhen} from "@src/components/utils/ShowWhen";
import {TRANSCRIBE_ROUTE} from "@src/constants";
import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import {TranscriptionStatus} from "@src/data/TranscriptionStatus.ts";
import {calculateProgress} from "@src/domain/CalculateProgress.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore";
import LogRocket from "logrocket";
import {type FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

function Login() {
	// Going to use programmatic navigation since the server on login will send back updatedMetaData if there is any, and any new images if we don't have the ID for one;
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | boolean>(false);
	const { setSelectedImage, refreshProject, setProgress } =
		useTranscriptionStore();

	async function loginAndSendLocalImages(e: FormEvent<HTMLFormElement>) {
		setErr(false);
		setLoading(true);
		// prevent Default cause we want the remote images back form server to sync to to idb first instead of just redirecting from server
		e.preventDefault();

		const idbInstance = IndexedDBImageRepository.getInstance();

		const formData = new FormData(e.currentTarget);
		const images = await idbInstance.retrieveAllImages();
		const imgIds = images?.map((image) => image.id) ?? [];
		formData.append("imgIds", JSON.stringify(imgIds));

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
			const { syncData, userId, userName, userEmail, error } = serverData;
			if (error) {
				toast.error(error, {
					position: "top-right",
				});
				setErr(error);
				setLoading(false);
				return;
			}

			// todo: store userId locally if you want to use or scope idb by it;
			console.log("userId", userId);
			connectUserWithAnalytics(userId, userName, userEmail);
			const imagesForStateSet = [];
			for await (const serverImgId of Object.keys(syncData)) {
				// if we have locally, get and update;
				const localImg = images?.find((img) => img.id === serverImgId);
				const withFalsyValsRemoved = Object.entries(
					syncData[serverImgId],
				).reduce((acc: TranscribableDocument, [key, value]) => {
					if (value) {
						acc[key] = value;
					}
					return acc;
				}, {} as TranscribableDocument);
				if (localImg) {
					const updated: TranscribableDocument = {
						...localImg, //spread properites only on idb first
						...withFalsyValsRemoved, //overwrite with spread from server any common properties Id is the same from server
						status: TranscriptionStatus.COMPLETED,
					};
					imagesForStateSet.push(updated);
					await idbInstance.storeImage(localImg.id, updated);
				} else {
					// else just create new
					imagesForStateSet.push({
						...withFalsyValsRemoved,
						status: TranscriptionStatus.COMPLETED,
					});
					await idbInstance.storeImage(withFalsyValsRemoved.id, {
						...withFalsyValsRemoved,
						status: TranscriptionStatus.COMPLETED,
					});
				}
			}
			setSelectedImage(imagesForStateSet[0]);
			setLoading(false);
			// refresh idx db
			refreshProject();
			const imageRepo = IndexedDBImageRepository.getInstance();
			const documents = await imageRepo.retrieveAllImages();
			setProgress(calculateProgress(documents ?? []));
			navigate(TRANSCRIBE_ROUTE);
		} catch (e) {
			console.error(e);
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
					onSubmit={loginAndSendLocalImages}
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
