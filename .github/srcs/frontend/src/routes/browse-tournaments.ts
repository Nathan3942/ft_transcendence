/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   browse-tournaments.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 16:33:40 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/09 15:39:34 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { deleteTournament, listOnlineTournament, type Tournament } from "../services/online";
import { setCurrentTournamentId } from "../services/onlineStore";

function navigate(path: string) {
  	window.dispatchEvent(new CustomEvent("navigate", { detail: { path } }));
}

function formatWinner(winnerId: number | null) {
  	return winnerId === null ? "—" : `#${winnerId}`;
}

function tournamentRow(t: Tournament, onDeleted: () => void): HTMLDivElement {
	const row = document.createElement("div");
	row.className =
		"w-full flex items-center justify-between p-3 rounded bg-white dark:bg-gray-800";

	// ---- bloc gauche : infos ----
	const left = document.createElement("div");
	left.className = "flex flex-col";

	const title = document.createElement("div");
	title.className = "text-lg font-semibold";
	title.textContent = `Tournament #${t.id} — ${t.name}`;

	const meta = document.createElement("div");
	meta.className = "text-sm opacity-70";
	meta.textContent = `Status: ${t.status}, Winner: ${formatWinner(
		t.winnerId
	)}, Created: ${t.createdAt}`;

	left.append(title, meta);

	// ---- bloc droite : actions ----
	const actions = document.createElement("div");
	actions.className = "flex gap-2";

	const openBtn = document.createElement("button");
	openBtn.className = "px-4 py-2 rounded bg-blue-600 text-white";
	openBtn.textContent = "Open";
	openBtn.onclick = () => {
		// ✅ adapte à ton routing
		// Si tu as une page tournament dédiée :
		setCurrentTournamentId(String(t.id));
		navigate(`/online-tournament`);

		// Sinon si tu utilises /game-online/:id :
		// navigate(`/game-online/${t.id}`);
	};

	const delBtn = document.createElement("button");
	delBtn.className = "px-4 py-2 rounded bg-red-600 text-white";
	delBtn.textContent = "Delete";
	delBtn.onclick = async () => {
		const ok = confirm(`Delete tournament #${t.id} ?`);
		if (!ok)
			return;

		try {
			// ✅ si tu as une API delete tournoi :
			await deleteTournament(t.id);
			onDeleted();

			alert("Delete tournament API not implemented yet.");
		}
		catch (e) {
			alert(`Delete failed: ${(e as Error).message}`);
		}
	};

	actions.append(openBtn, delBtn);
	row.append(left, actions);

	return row;
}

export default function createBrowseTournamentsPage(): HTMLDivElement {
    const page = document.createElement("div");
    page.className = "flex flex-col flex-1 min-h-0 p-6 gap-4";

    // ---- header ----
    const header = document.createElement("div");
    header.className = "flex items-center justify-between shrink-0";

    const h1 = document.createElement("div");
    h1.className = "text-2xl font-bold";
    h1.textContent = "Browse Tournaments";

    const back = document.createElement("button");
    back.className = "px-4 py-2 rounded bg-gray-300 dark:bg-gray-700";
    back.textContent = "Back";
    back.onclick = () => navigate("/game-online");

    header.append(h1, back);

    // ---- status + list container ----
    const status = document.createElement("div");
    status.className = "text-sm opacity-70 shrink-0";
    status.textContent = "Loading tournaments...";

	const panel = document.createElement("div");
	panel.className = "flex-1 min-h-0 overflow-y-auto rounded bg-black/5 dark:bg-white/5 p-3";

    const list = document.createElement("div");
    list.className = "flex flex-col gap-3";

	panel.appendChild(list);
    page.append(header, status, panel);

    async function load() {
        status.textContent = "Loading tournaments...";
        list.innerHTML = "";

        try {
        // ✅ idéalement:
        // const tournaments = await listOnlineTournaments();

        // ⚠️ ton code actuel
        const tournaments = await listOnlineTournament();

        if (!Array.isArray(tournaments) || tournaments.length === 0) {
            status.textContent = "No tournament yet. Create one!";
            return;
        }

        status.textContent = `${tournaments.length} tournament(s)`;

        tournaments.forEach((t: Tournament) => {
            	list.appendChild(tournamentRow(t, load));
        	});
        }
        catch (e) {
            status.textContent = `Error: ${(e as Error).message}`;
        }
    }

    load();
    return page;
}
