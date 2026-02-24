/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   online-match.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/19 17:15:35 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/24 18:04:53 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getCurrentMatchId } from "../services/onlineStore";
import { draw1v1 } from "../game/pong_render";
import { toRenderState, type RenderState1v1, type ServerGameState } from "../game/server_state_adapter";


type Dir = -1 | 0 | 1;

function randomId(): string {
	
	const c: any = globalThis.crypto as any;
	if (c && typeof	c.randomUUID === "function")
		return (c.randomUUID);
	return (`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);
}

function getClientId(): string {
	const key = "clientId";
	let v = localStorage.getItem(key);
	if (!v) {
		v = randomId();
		localStorage.setItem(key, v);
	}
	return (v);
}


function bindInput(ws: WebSocket, gameId: string, slot: "left" | "right") {
	let upPressed = false;
	let downPressed = false;
	let currentDir: Dir = 0;

	function computeDir(): Dir {
		if (upPressed && !downPressed)
			return (-1);
		if (!upPressed && downPressed)
			return (1);
		return (0);
	}

	function sendDir(dir: Dir) {
		if (ws.readyState !== WebSocket.OPEN)
			return;
		ws.send(
			JSON.stringify({
				type: "input",
				gameId,
				slot,
				input: {dir, ts: Date.now() },
			})
		);
	}

	function onKeyDown(e: KeyboardEvent) {

		if (e.repeat)
			return;
		if (e.key === "w")
			upPressed = true;
		else if (e.key === "s")
			downPressed = true;
		else
			return;

		const next = computeDir();
		if (next !== currentDir) {
			currentDir = next;
			sendDir(currentDir);
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		if (e.key === "w")
			upPressed = false;
		else if (e.key === "s")
			downPressed = false;
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
	let lastRenderState: RenderState1v1 | null = null;


	let rafId = 0;
	let running = true;

	function loop() {
		if (!running)
			return;

		if (lastRenderState) 
			draw1v1(ctx, canvas, lastRenderState);

		rafId = requestAnimationFrame(loop);
	}

	rafId = requestAnimationFrame(loop);

	const ws = new WebSocket(`ws://${window.location.hostname}:3000/ws`);

	let mySlot: "left" | "right" = "right";

	let unbindInput: null | (() => void) = null;

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
			})
		);
	};

	ws.onmessage = (e) => {
		let msg: any;
		try {
			msg = JSON.parse(e.data);
		}
		catch {
			console.log("WS raw: ", e.data);
			return;
		}

		if (msg.type === "match_waiting") {
			status.textContent = `Match #${msg.gameId}: waiting for 2nd player (${msg.count}/2)...`;
			return;
		}

		if (msg.type === "match_ready") {

			status.textContent = `Match #${msg.gameId}: player found! Starting...`;

			const matchId = getCurrentMatchId();
			if (matchId && !unbindInput) {
				unbindInput = bindInput(ws, String(matchId), mySlot);
			}
			return;
		}
		if (msg.type === "assigned_slot" && (msg.slot === "left" || msg.slot === "right")) {
			
			mySlot = msg.slot;
			if (unbindInput) {
				unbindInput();
				const matchId = getCurrentMatchId();
				if (matchId) unbindInput = bindInput(ws, String(matchId), mySlot);
			}
			return;
		}

		// --- tick serveur
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
		status.textContent = "WS closed";
	};

	const ro = new ResizeObserver(() => {
		const rect = gameContainer.getBoundingClientRect();
		const w = Math.max(300, Math.floor(rect.width));
		const h = Math.max(300, Math.floor(rect.height));
		canvas.width = w;
		canvas.height = h;

		// si on a déjà un state, on le reconvertit avec les nouvelles dimensions
		if (lastServerState) {
			lastRenderState = toRenderState(lastServerState, canvas.width, canvas.height);
		}
	});

	ro.observe(gameContainer);

	// --- cleanup SPA : stop raf + remove listeners + close ws
	const cleanup = () => {
		running = false;
		cancelAnimationFrame(rafId);

		ro.disconnect();

		if (unbindInput) {
			unbindInput();
			unbindInput = null;
		}

		try {
			ws.close(1000, "leave");
		} 
		catch {}
	};

	window.addEventListener("beforeunload", cleanup);

	const onNavigate = () => cleanup();
	window.addEventListener("navigate", onNavigate as any);

	return page;
}

