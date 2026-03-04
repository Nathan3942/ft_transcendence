/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   online-match.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/19 17:15:35 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/04 17:39:57 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getCurrentMatchId, getCurrentMatchMode } from "../services/onlineStore";
import { drawPong } from "../game/pong_render";
import { toRenderState, type RenderState, type ServerGameState, type GameSlot } from "../game/server_state_adapter";

function navigate(path: string) {
  window.dispatchEvent(new CustomEvent("navigate", { detail: { path } }));
}

type Dir = -1 | 0 | 1;

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

function isHorizontal(slot: GameSlot) {
	return slot === "top" || slot === "bottom";
}

function bindInput(ws: WebSocket, gameId: string, slot: GameSlot) {
	let negPressed = false; // up / left
	let posPressed = false; // down / right
	let currentDir: Dir = 0;

	function computeDir(): Dir {
		if (negPressed && !posPressed) 
			return -1;
		if (!negPressed && posPressed) 
			return 1;
		return 0;
	}

	function sendDir(dir: Dir) {
		if (ws.readyState !== WebSocket.OPEN)
			return;
		ws.send(JSON.stringify({ type: "input", gameId, slot, input: { dir, ts: Date.now() } }));
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.repeat)
			return;

		const horiz = isHorizontal(slot);
		const negKey = horiz ? "a" : "w";
		const posKey = horiz ? "d" : "s";

		if (e.key === negKey)
			negPressed = true;
		else if (e.key === posKey)
			posPressed = true;
		else
			return;

		const next = computeDir();
		if (next !== currentDir) {
			currentDir = next;
			sendDir(currentDir);
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		const horiz = isHorizontal(slot);
		const negKey = horiz ? "a" : "w";
		const posKey = horiz ? "d" : "s";

		if (e.key === negKey)
			negPressed = false;
		else if (e.key === posKey)
			posPressed = false;
		else
			return;

		const next = computeDir();
		if (next !== currentDir) {
			currentDir = next;
			sendDir(currentDir);
		}
	}

	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);

	return () => {
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
	};
}

export default function onlineMatch(): HTMLDivElement {
	const page = document.createElement("div");
	page.className = "flex flex-col flex-1 p-6 gap-4";

	const status = document.createElement("div");
	status.className = "text-xl font-semibold";
	status.textContent = "Connecting...";

	const gameContainer = document.createElement("div");
	gameContainer.className = "flex-1 rounded bg-black/10 dark:bg-white/10 overflow-hidden";

	page.append(status, gameContainer);

	const canvas = document.createElement("canvas");
	canvas.className = "w-full h-full block";
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	gameContainer.appendChild(canvas);

	const ctxMaybe = canvas.getContext("2d");
	if (!ctxMaybe) {
		status.textContent = "Canvas error (no 2d context)";
		return page;
	}
	const ctx: CanvasRenderingContext2D = ctxMaybe;

	let lastServerState: ServerGameState | null = null;
	let lastRenderState: RenderState | null = null;

	let mySlot: GameSlot = "left";
	let unbindInput: null | (() => void) = null;

	let running = true;
	let rafId = 0;

	const ws = new WebSocket(`ws://${window.location.hostname}:3000/ws`);

	// ResizeObserver
	const ro = new ResizeObserver(() => {
		const rect = gameContainer.getBoundingClientRect();
		canvas.width = Math.max(300, Math.floor(rect.width));
		canvas.height = Math.max(300, Math.floor(rect.height));
		if (lastServerState)
			lastRenderState = toRenderState(lastServerState, canvas.width, canvas.height);
	});
	ro.observe(gameContainer);

	// ✅ CLEANUP unique (évite TDZ + double-calls)
	const cleanup = () => {
		if (!running)
			return;
		running = false;

		cancelAnimationFrame(rafId);
		ro.disconnect();

		if (unbindInput) {
			unbindInput();
			unbindInput = null;
		}

		// prévenir serveur
		try {
			const matchId = getCurrentMatchId();
			if (matchId && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: "leave_game", gameId: matchId, clientId: getClientId() }));
			}
		}
		catch {}

		try {
			ws.close(1000, "leave");
		}
		catch {}

		window.removeEventListener("beforeunload", onBeforeUnload);
		window.removeEventListener("pagehide", onPageHide);
		window.removeEventListener("navigate", onNavigate as any);
	};

	// important : “back” / bfcache
	const onPageHide = () => cleanup();

	// refresh / close tab
	const onBeforeUnload = () => cleanup();

	// SPA navigation : cleanup quand on quitte /online-match
	const onNavigate = (ev: any) => {
		const nextPath = ev?.detail?.path as string | undefined;
		if (!nextPath) {
			cleanup();
			return;
		}
		if (nextPath !== "/online-match")
			cleanup();
	};

	window.addEventListener("beforeunload", onBeforeUnload);
	window.addEventListener("pagehide", onPageHide);
	window.addEventListener("navigate", onNavigate as any);

	// RAF loop
	function loop() {
		if (!running)
			return;
		if (lastRenderState)
			drawPong(ctx, canvas, lastRenderState, mySlot);
		rafId = requestAnimationFrame(loop);
	}
	rafId = requestAnimationFrame(loop);

	ws.onopen = () => {
		status.textContent = "Connected. Joining match...";
		const matchId = getCurrentMatchId();
		if (!matchId) {
			status.textContent = "No matchId (create match first).";
			return;
		}

		ws.send(
		JSON.stringify({
			type: "join_game",
			gameId: matchId,
			clientId: getClientId(),
			mode: getCurrentMatchMode(),
		})
		);
	};

	ws.onmessage = (e) => {
		let msg: any;
		try {
			msg = JSON.parse(e.data);
		}
		catch {
			return;
		}

		if (msg.type === "match_waiting") {
			status.textContent = `Match #${msg.gameId}: waiting (${msg.count}/${msg.playerNeeded})...`;
			return;
		}

		if (msg.type === "match_ready") {
			status.textContent = `Match #${msg.gameId}: starting...`;
			return;
		}

		if (msg.type === "game_paused") {
			status.textContent = `Paused (player ${msg.clientId} disconnected)`;
			return;
		}

		if (msg.type === "game_resumed") {
			status.textContent = `Game resumed`;
			return;
		}

		if (msg.type === "assigned_slot") {
			mySlot = msg.slot as GameSlot;
			const matchId = getCurrentMatchId();
			if (matchId) {
				if (unbindInput) unbindInput();
				unbindInput = bindInput(ws, String(matchId), mySlot);
			}
			return;
		}

		if (msg.type === "match_full") {
			alert("Match full");
			cleanup();
			navigate("/browse-games");
			return;
		}

		if (msg.type === "game_over") {
			const winner = msg.winnerName ?? msg.winnerUserId ?? msg.winnerSlot;
			status.textContent = `Winner: ${winner}`;
			if (unbindInput) {
				unbindInput();
				unbindInput = null;
			}
			alert(`Winner: ${winner}`);
			cleanup();
			navigate("/game-online");
			return;
		}

		if (msg.type === "game_tick" && msg.state) {
			lastServerState = msg.state as ServerGameState;
			lastRenderState = toRenderState(lastServerState, canvas.width, canvas.height);
			return;
		}
	};

	ws.onerror = () => {
		status.textContent = "WS error";
	};

	ws.onclose = () => {
		// si on est encore sur la page, affiche juste un message
		if (running) status.textContent = "WS closed";
	};

	return page;
}


