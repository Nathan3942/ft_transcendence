/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   browse-tournaments.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 16:33:40 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/01 19:06:31 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getRouter } from "../handler/routeHandler";
import { deleteTournament, listOnlineTournament, type Tournament } from "../services/online";
import { setCurrentTournamentId } from "../services/onlineStore";
import { t } from "../i18n/i18n";

function formatWinner(winnerId: number | null) {
  	return winnerId === null ? "—" : `#${winnerId}`;
}

function tournamentRow(tmnt: Tournament, onDeleted: () => void): HTMLDivElement {
	const row = document.createElement("div");
	row.className =
		"w-full flex items-center justify-between p-3 rounded bg-white dark:bg-gray-800";

	// ---- bloc gauche : infos ----
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

	// ---- bloc droite : actions ----
	const actions = document.createElement("div");
	actions.className = "flex gap-2";

	const openBtn = document.createElement("button");
	openBtn.className = "px-4 py-2 rounded bg-blue-600 text-white";
	openBtn.textContent = t("browseTournaments.open");
	openBtn.onclick = () => {
		// ✅ adapte à ton routing
		// Si tu as une page tournament dédiée :
		setCurrentTournamentId(String(tmnt.id));
		getRouter().lazyLoad(`/online-tournament`);

		// Sinon si tu utilises /game-online/:id :
		// navigate(`/game-online/${t.id}`);
	};

	const delBtn = document.createElement("button");
	delBtn.className = "px-4 py-2 rounded bg-red-600 text-white";
	delBtn.textContent = t("common.delete");
	delBtn.onclick = async () => {
		const ok = confirm(`${t("browseTournaments.deleteConfirm")} #${tmnt.id} ?`);
		if (!ok)
			return;

		try {
			// ✅ si tu as une API delete tournoi :
			await deleteTournament(tmnt.id);
			onDeleted();

			alert(t("browseTournaments.deleteNotImplemented"));
		}
		catch (e) {
			alert(`${t("browseTournaments.deleteFailed")}: ${(e as Error).message}`);
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
    h1.textContent = t("browseTournaments.title");

    const back = document.createElement("button");
    back.className = "px-4 py-2 rounded bg-gray-300 dark:bg-gray-700";
    back.textContent = t("common.back");
    back.onclick = () => getRouter().lazyLoad("/game-online");

    header.append(h1, back);

    // ---- status + list container ----
    const status = document.createElement("div");
    status.className = "text-sm opacity-70 shrink-0";
    status.textContent = t("browseTournaments.loading");

	const panel = document.createElement("div");
	panel.className = "flex-1 min-h-0 overflow-y-auto rounded bg-black/5 dark:bg-white/5 p-3";

    const list = document.createElement("div");
    list.className = "flex flex-col gap-3";

	panel.appendChild(list);
    page.append(header, status, panel);

    async function load() {
        status.textContent = t("browseTournaments.loading");
        list.innerHTML = "";

        try {
        // ✅ idéalement:
        // const tournaments = await listOnlineTournaments();

        // ⚠️ ton code actuel
        const tournaments = await listOnlineTournament();

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
            status.textContent = `${t("browseTournaments.error")}: ${(e as Error).message}`;
        }
    }

    load();
    return page;
}
