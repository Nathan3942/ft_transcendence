/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   browse-games.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/19 14:42:50 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/05 15:40:35 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { listOnlineMatches, deleteMatch, type Match } from "../services/online";
import { setCurrentMatchId } from "../services/onlineStore";

function navigate(path: string) {
	window.dispatchEvent(new CustomEvent("navigate", { detail: { path } }));
}

function matchRow(m: Match, onDeleted: () => void): HTMLDivElement {
	const row = document.createElement("div");
	row.className =
		"w-full flex items-center justify-between p-3 rounded bg-white dark:bg-gray-800";

	// ---- bloc gauche : infos ----
	const left = document.createElement("div");
	left.className = "flex flex-col";

	const title = document.createElement("div");
	title.className = "text-lg font-semibold";
	title.textContent = `Match #${m.id}`;

	const meta = document.createElement("div");
	meta.className = "text-sm opacity-70";
	meta.textContent = `Status: ${m.status}, Mode: ${m.mode}`;

	left.append(title, meta);

	// ---- bloc droite : actions ----
	const actions = document.createElement("div");
	actions.className = "flex gap-2";

	const joinBtn = document.createElement("button");
	joinBtn.className = "px-4 py-2 rounded bg-blue-600 text-white";
	joinBtn.textContent = "Join";
	joinBtn.onclick = () => {
		if (m.status === "finished")
			confirm(`Match ${m.id} finished`);
		else {
			setCurrentMatchId(String(m.id));
			navigate("/online-match");
		}
	};

	const delBtn = document.createElement("button");
	delBtn.className = "px-4 py-2 rounded bg-red-600 text-white";
	delBtn.textContent = "Delete";
	delBtn.onclick = async () => {
		const ok = confirm(`Delete match #${m.id} ?`);
		if (!ok) 
			return;
		try {
			await deleteMatch(m.id);
			onDeleted(); // refresh list
		} catch (e) {
			alert(`Delete failed: ${(e as Error).message}`);
		}
	};

	actions.append(joinBtn, delBtn);
	row.append(left, actions);

	return row;
}

export default function createBrowseGamesPage(): HTMLDivElement {
	const page = document.createElement("div");
	page.className = "flex flex-col flex-1 p-6 gap-4";

	// ---- header ----
	const header = document.createElement("div");
	header.className = "flex items-center justify-between";

	const h1 = document.createElement("div");
	h1.className = "text-2xl font-bold";
	h1.textContent = "Browse Games";

	const back = document.createElement("button");
	back.className = "px-4 py-2 rounded bg-gray-300 dark:bg-gray-700";
	back.textContent = "Back";
	back.onclick = () => navigate("/game-online");

	header.append(h1, back);

	// ---- status + list container ----
	const status = document.createElement("div");
	status.className = "text-sm opacity-70";
	status.textContent = "Loading matches...";

	const list = document.createElement("div");
	list.className = "flex flex-col gap-3";

	page.append(header, status, list);

	/*
		Charge la liste des matchs depuis l'API et met à jour le DOM.
		On l'appelle au chargement + après chaque delete.
	*/
	async function load() {
		status.textContent = "Loading matches...";
		list.innerHTML = "";

		try {
			const matches = await listOnlineMatches();

			if (!Array.isArray(matches) || matches.length === 0) {
				status.textContent = "No matches yet. Create one!";
				return;
			}

			status.textContent = `${matches.length} match(es)`;

			matches.forEach((m) => {
				list.appendChild(matchRow(m, load));
			});
		}
		catch (e) {
			status.textContent = `Error: ${(e as Error).message}`;
		}
	}

	load();

	return page;
}
