/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   online-tournament.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/09 15:18:28 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/08 11:34:56 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getRouter } from "../handler/routeHandler.js";
import { getItem } from "../helpers/localStoragehelper.js";
import { getCurrentTournamentId, setCurrentMatchId } from "../services/onlineStore.js";

function randomId(): string {
	const c: any = globalThis.crypto as any;
	if (c && typeof c.randomUUID === "function")
		return c.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function getClientId(): string {
	const key = "clientId";
	let v = sessionStorage.getItem(key);
	if (!v) {
		v = randomId();
		sessionStorage.setItem(key, v);
	}
	return v;
}

function getUserId(): string | null {
	return getItem<string>("username") ?? null;
}

function createMatchBox(match: any): HTMLDivElement {
	const box = document.createElement("div");
	box.className = "min-w-[220px] rounded bg-white dark:bg-gray-800 p-3 shadow flex flex-col gap-2";

	const p1 = document.createElement("div");
	p1.className = "px-2 py-1 rounded bg-gray-200 dark:bg-gray-700";
	p1.textContent = match.player1 ?? "TBD";

	const p2 = document.createElement("div");
	p2.className = "px-2 py-1 rounded bg-gray-200 dark:bg-gray-700";
	p2.textContent = match.player2 ?? "TBD";

	box.append(p1, p2);

	if (match.winner) {
		const winner = document.createElement("div");
		winner.className = "text-sm text-green-600 font-bold";
		winner.textContent = `Winner: ${match.winner}`;
		box.appendChild(winner);
	}

	if (match.matchId) {
		const info = document.createElement("div");
		info.className = "text-xs opacity-70";
		info.textContent = `Match #${match.matchId}`;
		box.appendChild(info);
	}

	return box;
}

function createRoundColumn(titleText: string, matches: any[]): HTMLDivElement {

	const col = document.createElement("div");
	col.className = "flex flex-col gap-4 items-stretch";

	const title = document.createElement("div");
	title.className = "text-xl font-bold text-center";
	title.textContent = titleText;

	col.appendChild(title);

	for (const match of matches) {
		col.appendChild(createMatchBox(match));
	}

	return col;
}

function renderBracket(container: HTMLDivElement, bracket: any) {

	container.innerHTML = "";

	const wrapper = document.createElement("div");
	wrapper.className = "flex gap-8 items-start min-w-max";

	wrapper.appendChild(createRoundColumn("Quarter Finals", bracket.quarterFinals ?? []));
	wrapper.appendChild(createRoundColumn("Semi Finals", bracket.semiFinals ?? []));
	wrapper.appendChild(createRoundColumn("Final", bracket.final ?? []));

	container.appendChild(wrapper);
}

function findMyMatch(bracket: any, clientId: string) {

	if (!bracket)
		return null;

	const allMatches = [
		...(bracket.quarterFinals ?? []),
		...(bracket.semiFinals ?? []),
		...(bracket.final ?? []),
	];

	const myMatches = allMatches.filter((match) =>
		match.player1ClientId === clientId || match.player2ClientId === clientId
	);

	if (myMatches.length === 0)
		return null;

	// priorité au match jouable
	const activeMatch = myMatches.find((match) =>
		match.matchId &&
		match.status !== "finished"
	);

	if (activeMatch)
		return activeMatch;

	// sinon retourne le dernier match trouvé
	return myMatches[myMatches.length - 1];
}

function updateMyMatchButton(button: HTMLButtonElement, bracket: any) {
	
	const myClientId = getClientId();
	const myMatch = findMyMatch(bracket, myClientId);

	if (!myMatch || !myMatch.matchId) {
		button.disabled = true;
		button.className = "px-4 py-2 rounded bg-gray-400 text-white cursor-not-allowed";
		button.textContent = "No match for you yet";
		button.onclick = null;
		return;
	}

	if (myMatch.status === "finished") {
		button.disabled = true;
		button.className = "px-4 py-2 rounded bg-gray-400 text-white cursor-not-allowed";
		button.textContent = `Match #${myMatch.matchId} finished`;
		button.onclick = null;
		return;
	}

	button.disabled = false;
	button.className = "px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white";
	button.textContent = `Go to my match (#${myMatch.matchId})`;
	button.onclick = () => {
		setCurrentMatchId(String(myMatch.matchId));
		getRouter().lazyLoad("/online-match");
	};
}

export default function onlineTournament(): HTMLDivElement {

	const page = document.createElement("div");
	page.className = "flex flex-col flex-1 p-6 gap-4";

	const status = document.createElement("div");
	status.className = "text-xl font-semibold";
	status.textContent = "Connecting...";

	const controls = document.createElement("div");
	controls.className = "flex items-center gap-3";

	const myMatchBtn = document.createElement("button");
	myMatchBtn.className = "px-4 py-2 rounded bg-gray-400 text-white cursor-not-allowed";
	myMatchBtn.textContent = "No match for you yet";
	myMatchBtn.disabled = true;

	controls.appendChild(myMatchBtn);

	const bracketContainer = document.createElement("div");
	bracketContainer.className = "flex-1 overflow-auto rounded bg-black/10 dark:bg-white/10 p-4";

	page.append(status, controls, bracketContainer);

	const ws = new WebSocket(`ws://${window.location.hostname}:3000/ws`);

	ws.onopen = () => {
		status.textContent = "Connected. Joining tournament...";
		const tournamentId = getCurrentTournamentId();
		if (!tournamentId) {
			status.textContent = "No tournamentId (create tournament first).";
			return;
		}
		
		ws.send(JSON.stringify({
			type: "join_tournament",
			tournamentId,
			clientId: getClientId(),
			userId: getItem<number>("userId"),
			username: getUserId()
		}));
	};

	ws.onmessage = (e) => {
		let msg: any;
		try {
			msg = JSON.parse(e.data);
		} catch {
			return;
		}

		if (msg.type === "tournament_waiting") {
			status.textContent = `Tournament #${msg.tournamentId}: waiting (${msg.count}/${msg.playerNeeded})...`;
			return;
		}

		if (msg.type === "tournament_started") {
			status.textContent = `Tournament #${msg.tournamentId}: started! ClientId: ${getClientId()}`;
			renderBracket(bracketContainer, msg.bracket);
			updateMyMatchButton(myMatchBtn, msg.bracket);
			return;
		}

		if (msg.type === "rejoin_tournament") {
			status.textContent = `Tournament #${msg.tournamentId}: Client: ${getClientId()} rejoin`;
			// renderBracket(bracketContainer, )
		}

		if (msg.type === "tournament_bracket_update") {
			renderBracket(bracketContainer, msg.bracket);
			updateMyMatchButton(myMatchBtn, msg.bracket);
			return;
		}

		if (msg.type === "tournament_finished") {

			status.textContent = `Winner: ${msg.winnerName}`;

			alert(`Tournament finished!\nWinner: ${msg.winnerName}`);
			getRouter().lazyLoad("/game-online");

			return;
		}

		if (msg.type === "tournament_full") {
			alert(`Tournament ${msg.tournamentId} full`);
			getRouter().lazyLoad("/browse-tournaments");
			return;
		}
	};

	return page;
}