/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   online-match.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/19 17:15:35 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/19 17:48:47 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getCurrentMatchId } from "../services/onlineStore";


function getClientId(): string {
	const key = "clientId";
	let v = localStorage.getItem(key);
	if (!v) {
		v = crypto.randomUUID();
		localStorage.setItem(key, v);
	}
	return (v);
}


export default function onlineMatch(): HTMLDivElement {

    const page = document.createElement("div");
    page.className = "flex flex-col flex-1 p-6 gap-4";

    const status = document.createElement("div");
    status.className = "text-xl font-semibold";
    status.textContent = "Connecting...";

    const gameContainer = document.createElement("div");
    gameContainer.className = "sflex-1 rounded bg-black/10 dark:bg-white/10";

    page.append(status, gameContainer);

    const ws = new WebSocket(`ws://${window.location.hostname}:3000/ws`);

    ws.onopen = () => {
        status.textContent = "Connected. Joining match...";
        const matchId = getCurrentMatchId();

        if (!matchId) {
			status.textContent = "No matchId (creat a match first).";
			return;
		}

		ws.send(JSON.stringify({ type: "join_game", gameId: matchId, clientId: getClientId() }));
    };

	ws.onmessage = (e) => {
		const msg = JSON.parse(e.data);

		if (msg.type === "match_waiting") {
			status.textContent = `Match #${msg.gameId}: waiting for 2nd player ${msg.count}/2...`;
			// affiche pong pause
			return;
		}

		if (msg.type === "match_ready") {
			status.textContent = `Match #${msg.gameId}: player found! Starting...`;

			return;
		}


	};

	ws.onerror = () => {
		status.textContent = "WS error";
	};

	ws.onclose = () => {
		status.textContent = "WS closed";
	};

	return (page);
}