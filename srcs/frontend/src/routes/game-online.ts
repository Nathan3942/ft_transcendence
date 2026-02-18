/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game-online.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 16:52:45 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/18 18:00:28 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import { createOnlineMatch, createOnlineTournament, browseGames } from "../services/online";
import { setCurrentMatchId, getCurrentMatchId } from "../services/onlineStore";


function navigate(path: string) {
	window.dispatchEvent(new CustomEvent("navigate", { detail: { path } }));
}


export default function createGameOnlinePage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	const matchId = getCurrentMatchId();

	if (matchId) {
		const page = document.createElement("div");
		page.className = "flex flex-col flex-1 p-6 gap-4";

		const title = document.createElement("div");
		title.className = "text-2xl";
		title.textContent = `Online Match #${matchId}`;

		const logBox = document.createElement("pre");
		logBox.className = "bg-black text-green-400 p-4 rounded h-64 overflow-auto text-sm";
		logBox.textContent = "Connecting WS...\n";

		page.append(title, logBox);

		const ws = new WebSocket("ws://192.168.1.40:3000/ws");

		type Dir = -1 | 0 | 1;

		let upPressed = false;
		let downPressed = false;
		let currentDir: Dir = 0;

		function computeDir(): Dir {
		if (upPressed && !downPressed) return -1;
		if (downPressed && !upPressed) return 1;
		return 0;
		}

		function sendDir(dir: Dir) {
		if (ws.readyState !== WebSocket.OPEN) return;

		ws.send(JSON.stringify({
			type: "input",
			gameId: matchId,
			slot: "left", // pour l’instant
			input: { dir, ts: Date.now() }
		}));
		}

		function onKeyDown(e: KeyboardEvent) {
		if (e.repeat) return;

		if (e.key === "w") upPressed = true;
		else if (e.key === "s") downPressed = true;
		else return;

		const next = computeDir();
		if (next !== currentDir) {
			currentDir = next;
			sendDir(currentDir);
		}
		}

		function onKeyUp(e: KeyboardEvent) {
		if (e.key === "w") upPressed = false;
		else if (e.key === "s") downPressed = false;
		else return;

		const next = computeDir();
		if (next !== currentDir) {
			currentDir = next;
			sendDir(currentDir);
		}
		}

		// ✅ bind
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);

		// ✅ cleanup quand tu quittes la page / ferme ws
		ws.addEventListener("close", () => {
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
		});

		ws.onopen = () => {
			logBox.textContent += "WS open\n";
			ws.send(JSON.stringify({ type: "join_game", gameId: matchId, slot: "left" }));
		};

		ws.onmessage = (e) => {
			logBox.textContent += `<= ${e.data}\n`;
			logBox.scrollTop = logBox.scrollHeight;
		};

		ws.onclose = (e) => {
			logBox.textContent += `WS close ${e.code} ${e.reason}\n`;
		};

		ws.onerror = () => {
			logBox.textContent += "WS error\n";
		};

		return page;
	}

	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-yellow-300 dark:bg-green-900", createButton({
			id: "create-match-button",
			extraClasses:btnClasses,
			buttonText: "Create Match",
			f: async () => {
				const id = await createOnlineMatch();
				setCurrentMatchId(id);
 				navigate("/game-online");  
			},
			icon: "assets/images/plus-large-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-yellow-400 dark:bg-yellow-900", createButton({
			id: "create-tournament-button",
			extraClasses: btnClasses,
			buttonText: "Create Tournament",
			f: async () => {
				const id = await createOnlineTournament();
				navigate(`/game-online/${id}`);
			},
			icon: "assets/images/trophy-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-orange-400 dark:bg-orange-900", createButton({
			id: "browse-matches-button",
			extraClasses: btnClasses,
			buttonText: "Browse Games",
			f: async () => {
				navigate("/games");
			},
			icon: "assets/images/list-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
		}))
	);

	outer.appendChild(inner);

	return outer;
}