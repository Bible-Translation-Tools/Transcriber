import { getCurrentUserId } from "@src/domain/CurrentUser.ts";
import { refreshProgress } from "@src/domain/ImageActions.ts";
import { useTranscriptionStore } from "@src/persistence/store/TranscriptionStore.ts";
import syncEngine from "@src/services/SyncEngine.ts";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NavBar: React.FC = () => {
	const { t } = useTranslation();
	const store = useTranscriptionStore();
	const navigate = useNavigate();
	const [isSyncing, setIsSyncing] = useState(false);

	const onSettingsClicked = () => {
		navigate("/settings");
	};

	const onRefreshClicked = async () => {
		const userId = getCurrentUserId();
		if (!userId || isSyncing) {
			return;
		}
		setIsSyncing(true);
		try {
			await syncEngine.sync(userId);
			await store.refreshProject();
			await refreshProgress(store, userId);
		} catch (error) {
			console.error("Manual sync failed", error);
			toast.error(t("Could not reach the server. Please try again."));
		} finally {
			setIsSyncing(false);
		}
	};

	return (
		<div className="flex items-center justify-between p-4 bg-white h-20 border-b border-gray-200">
			{/* Spacer where the language/book dropdowns lived. The panel now
			    shows every image regardless of project, so navbar-level
			    filtering went away with them. */}
			<div className="flex flex-1 grow items-center" />
			<div className="flex items-center gap-2">
				{/* Sync otherwise only runs on load, so this is how a user picks
				    up an edit made in another browser without reloading. */}
				<button
					type="button"
					className="flex flex-row text-xl bg-transparent hover:bg-gray-200 py-2 px-4 rounded items-center justify-items-center gap-2 disabled:opacity-50"
					onClick={onRefreshClicked}
					disabled={isSyncing}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="24px"
						viewBox="0 -960 960 960"
						width="24px"
						fill="#1f1f1f"
						className={isSyncing ? "animate-spin" : undefined}
						aria-hidden="true"
					>
						<path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
					</svg>
					{isSyncing ? t("Syncing...") : t("Refresh")}
				</button>
				<button
					type="button"
					className="flex flex-row text-xl bg-transparent hover:bg-gray-200 py-2 px-4 rounded items-center justify-items-center gap-2"
					onClick={onSettingsClicked}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="24px"
						viewBox="0 -960 960 960"
						width="24px"
						fill="#1f1f1f"
					>
						<path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
					</svg>
					{t("Settings")}
				</button>
			</div>
		</div>
	);
};

export default NavBar;
