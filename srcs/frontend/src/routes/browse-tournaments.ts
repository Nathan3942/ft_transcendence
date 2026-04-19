/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   browse-tournaments.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 16:33:40 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/17 16:22:42 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getRouter } from "../handler/routeHandler";
import { listOnlineTournament, updateTournamentStatus, type Tournament } from "../services/online";
import { setCurrentTournamentId } from "../services/onlineStore";
import { t } from "../i18n/i18n";

function formatWinner(winnerId: number | null) {
	return winnerId === null ? "—" : `#${winnerId}`;
}

function tournamentRow(tmnt: Tournament, onDeleted: () => void): HTMLDivElement {
	const row = document.createElement("div");
	row.className =
		"w-full flex items-center justify-between p-3 rounded bg-white dark:bg-gray-800";

	const left = document.createElement("div");
	left.className = "flex flex-col";

	const title = document.createElement("div");
	title.className = "text-lg font-semibold";
	title.textContent = `Tournament #${tmnt.id}`;

	const meta = document.createElement("div");
	meta.className = "text-sm opacity-70";
	meta.textContent = `${t("browseTournaments.status")}: ${tmnt.status}, ${t("browseTournaments.winner")}: ${formatWinner(
		tmnt.winnerId
	)}, ${t("browseTournaments.created")}: ${tmnt.createdAt}`;

	left.append(title, meta);

	const actions = document.createElement("div");
	actions.className = "flex gap-2";

	const openBtn = document.createElement("button");
	openBtn.className = "px-4 py-2 rounded bg-blue-600 text-white";
	openBtn.textContent = t("browseTournaments.open");
	openBtn.onclick = () => {
		setCurrentTournamentId(String(tmnt.id));
		getRouter().lazyLoad(`/online-tournament`);
	};

	const delBtn = document.createElement("button");
	delBtn.className = "px-4 py-2 rounded bg-red-600 text-white";
	delBtn.textContent = t("common.delete");

	let isDeleting = false;

	delBtn.onclick = async () => {
		if (isDeleting)
			return;

		const ok = confirm(`${t("browseTournaments.deleteConfirm")} #${tmnt.id} ?`);
		if (!ok)
			return;

		isDeleting = true;
		delBtn.disabled = true;
		delBtn.classList.add("opacity-50", "cursor-not-allowed");

		try {
			await updateTournamentStatus(tmnt.id, "finished");
			onDeleted();
		}
		catch (e) {
			const msg = (e as Error).message;

			if (msg.includes("429") || msg.includes("Rate limit") || msg.includes("Too Many Requests")) {
				alert(t("browseTournaments.tooManyRequests"));
			}
			else {
				alert(`${t("browseTournaments.deleteFailed")}: ${msg}`);
			}
		}
		finally {
			isDeleting = false;
			delBtn.disabled = false;
			delBtn.classList.remove("opacity-50", "cursor-not-allowed");
		}
	};

	actions.append(openBtn, delBtn);
	row.append(left, actions);

	return row;
}

export default function createBrowseTournamentsPage(): HTMLDivElement {
	const page = document.createElement("div");
	page.className = "flex flex-col flex-1 min-h-0 p-6 gap-4";

	const header = document.createElement("div");
	header.className = "flex items-center justify-between shrink-0";

	const h1 = document.createElement("div");
	h1.className = "text-2xl font-bold";
	h1.textContent = t("browseTournaments.title");

	const back = document.createElement("button");
	back.className = "px-4 py-2 rounded bg-gray-300 dark:bg-gray-700";
	back.textContent = t("common.back");
	back.onclick = () => getRouter().lazyLoad("/choose-browse");

	header.append(h1, back);

	const status = document.createElement("div");
	status.className = "text-sm opacity-70 shrink-0";
	status.textContent = t("browseTournaments.loading");

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
		status.textContent = t("browseTournaments.loading");
		list.innerHTML = "";

		try {
			const tournaments = (await listOnlineTournament()).filter(t => t.status !== "finished");

			if (!Array.isArray(tournaments) || tournaments.length === 0) {
				status.textContent = t("browseTournaments.empty");
				return;
			}

			status.textContent = `${tournaments.length} ${t("browseTournaments.tournamentCount")}`;

			tournaments.forEach((tmnt: Tournament) => {
				list.appendChild(tournamentRow(tmnt, load));
			});
		}
		catch (e) {
			const msg = (e as Error).message;

			if (msg.includes("429") || msg.includes("Rate limit") || msg.includes("Too Many Requests")) {
				status.textContent = t("browseTournaments.tooManyRequests");
			}
			else {
				status.textContent = `${t("browseTournaments.error")}: ${msg}`;
			}
		}
		finally {
			isLoading = false;
		}
	}

	load();
	return page;
}
