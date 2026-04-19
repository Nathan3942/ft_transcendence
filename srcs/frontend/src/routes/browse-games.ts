/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   browse-games.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/19 14:42:50 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/17 16:25:51 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getRouter } from "../handler/routeHandler";
import { listOnlineMatches, type Match, updateMatchStatus } from "../services/online";
import { setCurrentMatchId } from "../services/onlineStore";
import { t } from "../i18n/i18n";

function matchRow(m: Match, onDeleted: () => void): HTMLDivElement {
	const row = document.createElement("div");
	row.className = "w-full flex items-center justify-between p-3 rounded bg-white dark:bg-gray-800";

	const left = document.createElement("div");
	left.className = "flex flex-col";

	const title = document.createElement("div");
	title.className = "text-lg font-semibold";
	title.textContent = `${t("common.match")} #${m.id}`;

	const meta = document.createElement("div");
	meta.className = "text-sm opacity-70";
	meta.textContent = `${t("browseGames.status")}: ${m.status}, ${t("browseGames.mode")}: ${m.mode}`;

	left.append(title, meta);

	const actions = document.createElement("div");
	actions.className = "flex gap-2";

	const joinBtn = document.createElement("button");
	joinBtn.className = "px-4 py-2 rounded bg-blue-600 text-white";
	joinBtn.textContent = t("browseGames.join");

	let isJoining = false;
	joinBtn.onclick = async () => {
		if (isJoining)
			return;

		if (m.status === "finished") {
			alert(`${t("common.match")} ${m.id} ${t("browseGames.matchFinished")}`);
			return;
		}

		isJoining = true;
		joinBtn.disabled = true;
		joinBtn.classList.add("opacity-50", "cursor-not-allowed");

		try {
			setCurrentMatchId(String(m.id));
			await getRouter().lazyLoad("/online-match");
		}
		finally {
			isJoining = false;
			joinBtn.disabled = false;
			joinBtn.classList.remove("opacity-50", "cursor-not-allowed");
		}
	};

	const delBtn = document.createElement("button");
	delBtn.className = "px-4 py-2 rounded bg-red-600 text-white";
	delBtn.textContent = t("common.delete");

	let isDeleting = false;
	delBtn.onclick = async () => {
		if (isDeleting)
			return;

		const ok = confirm(`${t("browseGames.deleteConfirm")} #${m.id} ?`);
		if (!ok)
			return;

		isDeleting = true;
		delBtn.disabled = true;
		delBtn.classList.add("opacity-50", "cursor-not-allowed");

		try {
			await updateMatchStatus(m.id, "finished");
			onDeleted();
		}
		catch (e) {
			const msg = (e as Error).message;

			if (msg.includes("429") || msg.includes("Rate limit") || msg.includes("Too Many Requests")) {
				alert(t("browseGames.tooManyRequests"));
			}
			else {
				alert(`${t("browseGames.deleteFailed")}: ${msg}`);
			}
		}
		finally {
			isDeleting = false;
			delBtn.disabled = false;
			delBtn.classList.remove("opacity-50", "cursor-not-allowed");
		}
	};

	actions.append(joinBtn, delBtn);
	row.append(left, actions);

	return row;
}

export default function createBrowseGamesPage(): HTMLDivElement {
	const page = document.createElement("div");
	page.className = "flex flex-col flex-1 min-h-0 p-6 gap-4";

	const header = document.createElement("div");
	header.className = "flex items-center justify-between shrink-0";

	const h1 = document.createElement("div");
	h1.className = "text-2xl font-bold";
	h1.textContent = t("browseGames.title");

	const back = document.createElement("button");
	back.className = "px-4 py-2 rounded bg-gray-300 dark:bg-gray-700";
	back.textContent = t("common.back");
	back.onclick = () => getRouter().lazyLoad("/choose-browse");

	header.append(h1, back);

	const status = document.createElement("div");
	status.className = "text-sm opacity-70 shrink-0";
	status.textContent = t("browseGames.loading");

	const panel = document.createElement("div");
	panel.className = "flex-1 min-h-0 overflow-y-auto rounded bg-black/5 dark:bg-white/5 p-3";

	const list = document.createElement("div");
	list.className = "flex flex-col gap-3";

	panel.appendChild(list);
	page.append(header, status, panel);

	let isLoading = false;

	async function load() {
		if (isLoading)
			return;

		isLoading = true;
		status.textContent = t("browseGames.loading");
		list.innerHTML = "";

		try {
			const matches = (await listOnlineMatches()).filter(
				m => !m.tournamentId && m.status !== "finished"
			);

			if (!Array.isArray(matches) || matches.length === 0) {
				status.textContent = t("browseGames.empty");
				return;
			}

			status.textContent = `${matches.length} ${t("browseGames.matchCount")}`;

			matches.forEach((m) => {
				list.appendChild(matchRow(m, load));
			});
		}
		catch (e) {
			const msg = (e as Error).message;

			if (msg.includes("429") || msg.includes("Rate limit") || msg.includes("Too Many Requests")) {
				status.textContent = t("browseGames.tooManyRequests");
			}
			else {
				status.textContent = `${t("browseGames.error")}: ${msg}`;
			}
		}
		finally {
			isLoading = false;
		}
	}

	load();

	return page;
}