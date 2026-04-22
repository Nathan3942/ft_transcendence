/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   online-match.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/19 17:15:35 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/22 16:05:43 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getCurrentMatchId, getCurrentMatchMode, setCurrentTournamentId } from "../services/onlineStore.js";
import { drawPong } from "../game/pong_render.js";
import { toRenderState, type RenderState, type ServerGameState, type GameSlot } from "../game/server_state_adapter.js";
import { getRouter } from "../handler/routeHandler.js";
import { t } from "../i18n/i18n.js";
import { getItem } from "../helpers/localStoragehelper.js";

type Dir = -1 | 0 | 1;

let gameEnded = false;

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

function getUserName(): string | null {
	return getItem<string>("username") ?? null;
}

function isHorizontal(slot: GameSlot) {
	return slot === "top" || slot === "bottom";
}

function bindInput(ws: WebSocket, gameId: string, slot: GameSlot, canvas: HTMLCanvasElement) {
	let negPressed = false;
	let posPressed = false;
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

	function updateDir(next: Dir) {
		if (next !== currentDir) {
			currentDir = next;
			sendDir(currentDir);
		}
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.repeat)
			return;

		if (e.key === "Escape") {
			ws.send(JSON.stringify({
				type: "pause_toggle",
				gameId,
				clientId: getClientId(),
				userName: getUserName()
			}));
			return;
		}

		const horiz = isHorizontal(slot);
		const negKey = horiz ? "a" : "w";
		const posKey = horiz ? "d" : "s";

		if (e.key === negKey)
			negPressed = true;
		else if (e.key === posKey)
			posPressed = true;
		else
			return;

		updateDir(computeDir());
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

		updateDir(computeDir());
	}

	function touchDirFromEvent(e: TouchEvent): Dir {
		if (e.touches.length === 0)
			return 0;

		const tTouch = e.touches[0];
		const rect = canvas.getBoundingClientRect();
		const localX = tTouch.clientX - rect.left;
		const localY = tTouch.clientY - rect.top;

		const horiz = isHorizontal(slot);

		if (horiz) {
			const centerX = rect.width / 2;
			const deadZone = Math.max(20, rect.width * 0.08);

			if (localX < centerX - deadZone)
				return -1;
			if (localX > centerX + deadZone)
				return 1;
			return 0;
		}

		const centerY = rect.height / 2;
		const deadZone = Math.max(20, rect.height * 0.08);

		if (localY < centerY - deadZone)
			return -1;
		if (localY > centerY + deadZone)
			return 1;
		return 0;
	}

	function onTouchStart(e: TouchEvent) {
		e.preventDefault();
		updateDir(touchDirFromEvent(e));
	}

	function onTouchMove(e: TouchEvent) {
		e.preventDefault();
		updateDir(touchDirFromEvent(e));
	}

	function onTouchEnd(e: TouchEvent) {
		e.preventDefault();
		updateDir(0);
	}

	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);

	canvas.addEventListener("touchstart", onTouchStart, { passive: false });
	canvas.addEventListener("touchmove", onTouchMove, { passive: false });
	canvas.addEventListener("touchend", onTouchEnd, { passive: false });
	canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });

	return () => {
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);

		canvas.removeEventListener("touchstart", onTouchStart);
		canvas.removeEventListener("touchmove", onTouchMove);
		canvas.removeEventListener("touchend", onTouchEnd);
		canvas.removeEventListener("touchcancel", onTouchEnd);
	};
}

export default function onlineMatch(): HTMLDivElement {
	const page = document.createElement("div");
	page.className = "flex flex-col flex-1 p-6 gap-4";
	page.style.width = "100%";
	page.style.height = "80%";

	const status = document.createElement("div");
	status.className = "text-xl font-semibold";
	status.textContent = t("onlineMatch.connecting");

	const gameContainer = document.createElement("div");
	gameContainer.className = "flex-1 rounded bg-black/10 dark:bg-white/10 overflow-hidden";

	page.append(status, gameContainer);

	const canvas = document.createElement("canvas");
	canvas.className = "w-full h-full block";
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	canvas.style.touchAction = "none";
	gameContainer.appendChild(canvas);

	const ctxMaybe = canvas.getContext("2d");
	if (!ctxMaybe) {
		status.textContent = t("onlineMatch.canvasError");
		return page;
	}
	const ctx: CanvasRenderingContext2D = ctxMaybe;

	let lastServerState: ServerGameState | null = null;
	let lastRenderState: RenderState | null = null;

	let mySlot: GameSlot = "left";
	let unbindInput: null | (() => void) = null;

	let running = true;
	let rafId = 0;

	const ws = new WebSocket(`wss://${window.location.host}/ws`);

	const ro = new ResizeObserver(() => {
		const rect = gameContainer.getBoundingClientRect();
		canvas.width = Math.max(300, Math.floor(rect.width));
		canvas.height = Math.max(300, Math.floor(rect.height));

		if (lastServerState)
			lastRenderState = toRenderState(lastServerState, canvas.width, canvas.height);
	});
	ro.observe(gameContainer);

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

		try {
			const matchId = getCurrentMatchId();
			if (!gameEnded && matchId && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({
					type: "leave_game",
					gameId: matchId,
					clientId: getClientId(),
					userId: getItem<number>("userId"),
					userName: getUserName()
				}));
			}
		} catch {}

		try {
			ws.close(1000, "leave");
		} catch {}

		window.removeEventListener("beforeunload", onBeforeUnload);
		window.removeEventListener("pagehide", onPageHide);
		window.removeEventListener("navigate", onNavigate as any);
		window.removeEventListener("popstate", cleanup);
	};

	const onPageHide = () => cleanup();
	const onBeforeUnload = () => cleanup();

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
	window.addEventListener("popstate", cleanup);
	window.addEventListener("pageshow", (event) => {
		if (event.persisted) {
			window.location.reload();
		}
	});

	function loop() {
		if (!running)
			return;

		if (lastRenderState)
			drawPong(ctx, canvas, lastRenderState, mySlot);

		rafId = requestAnimationFrame(loop);
	}
	rafId = requestAnimationFrame(loop);

	ws.onopen = () => {
		status.textContent = t("onlineMatch.joiningMatch");
		const matchId = getCurrentMatchId();
		if (!matchId) {
			status.textContent = t("onlineMatch.noMatchId");
			return;
		}

		ws.send(JSON.stringify({
			type: "join_game",
			gameId: matchId,
			clientId: getClientId(),
			userId: getItem<number>("userId"),
			username: getItem<string>("username"),
			mode: getCurrentMatchMode(),
		}));
	};

	ws.onmessage = (e) => {
		let msg: any;
		try {
			msg = JSON.parse(e.data);
		} catch {
			return;
		}

		if (msg.type === "match_waiting") {
			status.textContent = `${t("common.match")} #${msg.gameId}: ${t("onlineMatch.waiting")} (${msg.count}/${msg.playerNeeded})...`;
			return;
		}

		if (msg.type === "match_ready") {
			status.textContent = `${t("common.match")} #${msg.gameId}: ${t("onlineMatch.starting")}`;
			return;
		}

		if (msg.type === "game_paused") {
			
			if (msg.reason === "Escape")
				status.textContent = `${t("onlineMatch.pausedBy")} ${msg.userName}`;
			else
				status.textContent = `${t("onlineMatch.pausedPlayer")} ${msg.userName} ${t("onlineMatch.playerDisconnected")}`;
			return;
		}

		if (msg.type === "game_resumed") {
			status.textContent = t("onlineMatch.resumed");
			return;
		}

		if (msg.type === "assigned_slot") {
			mySlot = msg.slot as GameSlot;
			const matchId = getCurrentMatchId();
			if (matchId) {
				if (unbindInput)
					unbindInput();
				unbindInput = bindInput(ws, String(matchId), mySlot, canvas);
			}
			return;
		}

		if (msg.type === "match_full") {
			alert(t("onlineMatch.matchFull"));
			cleanup();
			getRouter().lazyLoad("/browse-games");
			return;
		}

		if (msg.type === "game_over") {
			
			gameEnded = true;
			const winner = msg.winnerName ?? msg.winnerUserId ?? msg.winnerSlot;

			status.textContent = `${t("onlineMatch.winner")}: ${winner}`;

			if (unbindInput) {
				unbindInput();
				unbindInput = null;
			}

			setTimeout(() => {
				cleanup();

				if (msg.tournamentId && !msg.tournamentFinished) {
					setCurrentTournamentId(String(msg.tournamentId));
					getRouter().lazyLoad("/online-tournament");
				} else {
					if (!msg.tournamentId)
						alert(`${t("onlineMatch.winner")}: ${winner}`);
					getRouter().lazyLoad("/game-online");
				}
			}, 1500);
			return;
		}

		if (msg.type === "match_deleted") {
			status.textContent = t("onlineMatch.matchDeleted");

			if (unbindInput) {
				unbindInput();
				unbindInput = null;
			}

			setTimeout(() => {
				cleanup();
				alert(t("onlineMatch.matchDeleted"));
				getRouter().lazyLoad("/game-online");
			}, 300);

			return;
		}

		if (msg.type === "game_tick" && msg.state) {
			lastServerState = msg.state as ServerGameState;
			lastRenderState = toRenderState(lastServerState, canvas.width, canvas.height);
			return;
		}
	};

	ws.onerror = () => {
		status.textContent = t("onlineMatch.wsError");
	};

	ws.onclose = () => {
		if (running)
			status.textContent = t("onlineMatch.wsClosed");
	};

	return page;
}