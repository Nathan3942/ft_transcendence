/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   plugin.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/13 15:48:09 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/21 02:54:52 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
    branche socket sur fastify et expose le hub sur l'app
*/

import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import type { FastifyPluginAsync } from "fastify";
import type WebSocket from "ws";

import { WsHub, type WsSocket } from "./hub";
import type { WsClientEvent, WsEnvelope, WsRoom } from "./events";

import { GameManager } from "../game/gameManager";
import { getMatchStatus, updateMatchStatus } from "../services/matchService";
import { getMatchById } from "../repository/matchesRepository";
import { getTournamentStatus, updateTournamentStatus } from "../services/tournamentService";
import { TournamentMaganer } from "../tournament/tournamentManager";
import ms from "zod/v4/locales/ms.js";

import cookie from "@fastify/cookie";
import { queryExecute } from "../database/queryWrapper";


export type ModeStr = "1v1" | "2v2" | "3p" | "4p";

type Slot1v1 = "left" | "right";
type Slot2v2 = "left1" | "left2" | "right1" | "right2";
type Slot3p = "left" | "right" | "top";
type Slot4p = "left" | "right" | "top" | "bottom";

export type GameSlot = Slot1v1 | Slot2v2 | Slot3p | Slot4p;

const userConnections = new Map<number, number>();

const sockets = new Set<WsSocket>();

const disconnectTimers = new Map<number, NodeJS.Timeout>();

// etend le type FastifyInstance pour l'ajouter au wsHub
declare module "fastify" {
	interface FastifyInstance {
		wsHub: WsHub;
		gameManager: GameManager;
		tournamentManager: TournamentMaganer;
	}
}

// pase JSON en securite
function parseJson<T>(raw: string): T | null {
    try {
        return JSON.parse(raw) as T;
    }
    catch {
        return null;
    }
}

function normalizeMode(m: unknown): ModeStr {
	if (m === "1v1" || m === "2v2" || m === "3p" || m === "4p") return m;
	return "1v1";
}

function slotsForMode(mode: ModeStr): GameSlot[] {
	switch (mode) {
		case "2v2":
		return ["left1", "left2", "right1", "right2"];
		case "3p":
		return ["left", "right", "top"];
		case "4p":
		return ["left", "right", "top", "bottom"];
		default:
		return ["left", "right"];
	}
}


/**
 * Retourne le slot si clientId est déjà enregistré.
 * Sinon retourne le premier slot libre.
 * Sinon null si match plein.
 */
function pickSlotForUser(game: any, mode: ModeStr, userId: number): GameSlot | null {
	const slots = slotsForMode(mode);

	// 1) Reconnect
	for (const s of slots) {
		if (game.players?.[s]?.userId === userId)
			return s;
	}

	// 2) Nouveau joueur
	for (const s of slots) {
		if (!game.players?.[s]?.userId)
			return s;
	}

	return null;
}

function countRegisteredPlayers(game: any, mode: ModeStr): number {
	const slots = slotsForMode(mode);
	let c = 0;
	for (const s of slots) {
		if (game.players?.[s]?.userId)
			c++;
	}
	return c;
}

function randomId(): string {
	const g: any = globalThis as any;
	if (g.crypto?.randomUUID)
		return g.crypto.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function handleUserConnect(userId: number) {
	const count = userConnections.get(userId) ?? 0;

	const pendingTimer = disconnectTimers.get(userId);
	if (pendingTimer) {
		clearTimeout(pendingTimer);
		disconnectTimers.delete(userId);
	}

	userConnections.set(userId, count + 1);

	if (count === 0) {
		console.log(`User ${userId} ONLINE`);

		queryExecute(
			`UPDATE users SET is_online = 1 WHERE id = ?`,
			[userId]
		);
	}
}

function handleUserDisconnect(userId: number) {
	const count = userConnections.get(userId);

	if (!count)
		return;

	if (count > 1) {
		userConnections.set(userId, count - 1);
		return;
	}

	// plus socket active user
	userConnections.delete(userId);

	// pas plusieurs timers meme user
	const oldTimer = disconnectTimers.get(userId);
	if (oldTimer) {
		clearTimeout(oldTimer);
	}

	const timer = setTimeout(() => {
		if (!userConnections.has(userId)) {
			console.log(`User ${userId} OFFLINE`);

			queryExecute(
				`UPDATE users SET is_online = 0 WHERE id = ?`,
				[userId]
			);
		}

		disconnectTimers.delete(userId);
	}, 3000); // délai 3 secondes

	disconnectTimers.set(userId, timer);
}

export const wsPlugin: FastifyPluginAsync = fp(async (app) => {

	app.log.info("✅ wsPlugin loaded");
    //active les websockets sur fastify
    await app.register(websocket);

    //cree le hub et lexpose sur fastify
    const hub = new WsHub(app.log);
    app.decorate("wsHub", hub);

	const tournamentManager = new TournamentMaganer();
	const gameManager = new GameManager(
		app.log,
		(room, payload) => hub.broadcast(room as any, payload),
		tournamentManager
	);

	app.decorate("gameManager", gameManager);
	app.decorate("tournamentManager", tournamentManager);


	function leaveCurrentGame(ws: WsSocket) {
		if (!ws._gameId || !ws._userId)
			return;

		const gameId = ws._gameId;
		const userId = ws._userId;
		const room = `game:${gameId}` as WsRoom;

		hub.leave(ws, room);

		const match = getMatchById(gameId);

		if (match?.status === "pending") {
			app.log.info({ gameId, userId }, "Pending match: unregister player");
			gameManager.unregisterPlayer(gameId, userId);

			const game = gameManager.get(gameId);
			if (game) {
				const mode = normalizeMode(game.state.mode);
				const count = countRegisteredPlayers(game, mode);
				const playerNeeded = slotsForMode(mode).length;

				hub.broadcast(room, { type: "match_waiting", gameId, count, playerNeeded, mode });
			}
		}
		else {
			app.log.info({ gameId, userId }, "Running match: pause game");
			gameManager.pauseGame(gameId, "player_disconnect", ws._clientId ?? "", userId, ws._username ?? "");
		}

		ws._gameId = undefined;
		ws._slot = undefined;
	}


	function leaveCurrentTournament(ws: WsSocket) {
		
		if (!ws._tournamentId || !ws._userId)
			return;

		const tournamentId = String(ws._tournamentId);
		const userId = ws._userId;
		const room = `tournament:${tournamentId}` as WsRoom;

		hub.leave(ws, room);

		const status = getTournamentStatus(tournamentId);

		if (status === "open") {
			
			app.log.info({ tournamentId, userId }, "Pending tournament: unregister player");
			tournamentManager.unregisterTournamentPlayer(tournamentId, userId);

			const count = tournamentManager.countTournamentPlayers(tournamentId);
			const needed = 8;

			hub.broadcast(room, { type: "tournament_waiting", tournamentId, count, playerNeeded: needed, });
		}

		ws._tournamentId = undefined;
	}

    /* 
    	endpoint websocket 
		client co a l'url
		fastify passe la co de http a ws    
    */
	app.get("/ws", { websocket: true }, (connection, req) => {

		
		const ws = ((connection as any).socket ?? (connection as any)) as WsSocket;

		if (!ws || typeof (ws as any).on !== "function") {
			app.log.error({ connectionKeys: Object.keys(connection as any) }, "WS: invalid connection object");
			return;
		}

		const cookies = cookie.parse(req.headers.cookie || "");
		const token = cookies.token;

		if (!token) {
			ws.close(1008, "No token");
			return;
		}

		let payload: any;

		try {
			payload = app.jwt.verify(token);
		} catch (err) {
			ws.close(1008, "Invalid token");
			return;
		}
		

		const userid = payload.id;
		ws._userId = userid;

		handleUserConnect(payload.id);
		sockets.add(ws);

		ws._wsId = randomId();

		app.log.info({ wsId: ws._wsId, ip: req.ip }, "WS connected");

		hub.join(ws, "global");
		// hub.join(ws, `user:${ws._userId}`);

		hub.send(ws, { type: "hello", serverTime: Date.now() });

		//	qd client envoie msg on parse en json et route selon msg.type
		ws.on("message", (buf: WebSocket.RawData) => {
			const raw = typeof buf === "string" ? buf : buf.toString("utf8");
			const msg = parseJson<WsEnvelope<WsClientEvent>>(raw);

			if (!msg?.type) {
				hub.send(ws, { type: "error", code: "BAD_JSON", message: "Invalid JSON" });
				return;
			}

			if (msg.type === "ping") {
				hub.send(ws, { type: "hello", serverTime: Date.now() });
				return;
			}

			if (msg.type === "subscribe") {

				if (!ws._userId) {
				
					hub.send(ws, { type: "error", code: "UNAUTHORIZED", message: "Not authenticated" });
					return;
				}

				if (msg.room.startsWith("user:")) {
				
					const target = Number(msg.room.slice("user:".length));

					if (target !== ws._userId) {
						hub.send(ws, { type: "error", code: "FORBIDDEN", message: "Cannot subscribe to other user room" });
						return;
					}
				}

				

				hub.join(ws, msg.room as WsRoom);
				hub.send(ws, { type: "subscribed", room: msg.room });
				
				return;
			}

			if (msg.type === "unsubscribe") {
				
				hub.leave(ws, msg.room as WsRoom);
				hub.send(ws, { type: "unsubscribed", room: msg.room });
				console.log(`user: ${ws._userId} disconnected\n\n`);
				return;
			}


			if (msg.type === "join_game") {
				
				console.log(`user id 1: ${ws._userId}`);
				if (!ws._userId)
					return;
				
				const room = `game:${msg.gameId}` as WsRoom;
				ws._gameId = msg.gameId;

				if (getMatchStatus(ws._gameId) === "finished")
					return;

				const match = getMatchById(msg.gameId);
				const mode = normalizeMode(match?.mode || msg.mode || "1v1");

				const game = gameManager.getAndCreatGame(msg.gameId, mode);

				ws._clientId = msg.clientId;
				ws._username = msg.username;
				
				const slot = pickSlotForUser(game, mode, ws._userId);

				if (!slot) {

					hub.send(ws, { type: "match_full", gameId: msg.gameId });
					setTimeout(() => {
						try {
							ws.close(1008, "Match full");
						}
						catch {}
					}, 30);
					return;
				}

				if (gameManager.isDuplicatePlayer(msg.gameId, ws._userId, slot)) {
					hub.send(ws, {
						type: "error",
						code: "DUPLICATE_PLAYER",
						message: "This user is already registered in this game"
					});
					return;
				}

				ws._slot = slot;

				gameManager.registerPlayer(msg.gameId, slot, ws._clientId, ws._userId, ws._username);

				hub.join(ws, room);
				
				hub.send(ws, { type: "assigned_slot", gameId: msg.gameId, slot, mode });

				const count = countRegisteredPlayers(game, mode);
        		const playerNeeded = slotsForMode(mode).length;

		
				if (count < playerNeeded) {
					hub.broadcast(room, { type: "match_waiting", gameId: msg.gameId, count, playerNeeded, mode });
					return;
				}
				
				if (game.state.status === "paused")
					gameManager.resumeGame(msg.gameId);
				
				updateMatchStatus(msg.gameId, "in_progress");
				hub.broadcast(room, { type: "match_ready", gameId: msg.gameId, count, mode });

				gameManager.joinGame(ws, msg.gameId);

				return;
			}


			if (msg.type === "join_tournament") {
				const room = `tournament:${msg.tournamentId}` as WsRoom;
				ws._tournamentId = msg.tournamentId;
				ws._clientId = msg.clientId;
				ws._username = msg.username;

				const tournamentId = msg.tournamentId;
				const status = getTournamentStatus(tournamentId);

				hub.join(ws, room);

				if (status === "finished") {
					return;
				}

				// Si tournoi en cours, seuls les joueurs déjà enregistrés peuvent rejoin
				if (status === "in_progress" && !tournamentManager.isTournamentUser(tournamentId, ws._userId)) {
					hub.send(ws, {
						type: "tournament_full",
						tournamentId,
					});
					return;
				}

				// Enregistrer le joueur si pas encore connu
				if (!tournamentManager.isTournamentUser(tournamentId, ws._userId)) {
					tournamentManager.registerTournamentPlayer(
						tournamentId,
						ws._clientId,
						ws._userId,
						msg.username
					);
				}

				const count = tournamentManager.countTournamentPlayers(tournamentId);
				const needed = 8;

				if (count < needed) {
					hub.broadcast(room, {
						type: "tournament_waiting",
						tournamentId,
						count,
						playerNeeded: needed,
					});
					return;
				}

				// Si tournoi déjà lancé, on renvoie juste le bracket courant
				if (status === "in_progress") {
					hub.send(ws, {
						type: "tournament_bracket_update",
						tournamentId,
						bracket: tournamentManager.getBracket(tournamentId),
					});
					return;
				}

				// Lancement initial
				updateTournamentStatus(tournamentId, "in_progress");

				const bracket = tournamentManager.startTournament(tournamentId);

				if (!bracket) {
					hub.send(ws, {
						type: "error",
						code: "TOURNAMENT_START_FAILED",
						message: "Unable to start tournament",
					});
					return;
				}

				hub.broadcast(room, {
					type: "tournament_started",
					tournamentId,
					count,
					bracket,
				});

				return;
			}

		


			if (msg.type === "input") {

				gameManager.input(msg.gameId, msg.slot as any, msg.input as any);
				return;
			}

			if (msg.type === "leave_game") {

				leaveCurrentGame(ws);
				return;
			}

			if (msg.type === "leave_tournament") {

				leaveCurrentTournament(ws);
				return;
			}

			if (msg.type === "pause_toggle") {
				
				const g = gameManager.get(msg.gameId);
				if (!g)
					return;
				
				if (g.state.status === "running") {
					g.loop.pause();
					hub.broadcast(`game:${msg.gameId}`, { type: "game_paused", reason: "Escape", clientId: msg.clientId, userName: msg.userName });
				}
				else if (g.state.status === "paused") {
					g.loop.resume();
					hub.broadcast(`game:${msg.gameId}`, { type: "game_resumed" });
				}
				
				return;
			}

			

			hub.send(ws, { type: "error", code: "UNKNOWN_EVENT", message: "Unknown event type" });
		});
		

		ws.on("close", (code, reason) => {

			leaveCurrentGame(ws);
			leaveCurrentTournament(ws);
			hub.leaveAll(ws);

			if (ws._userId)
				handleUserDisconnect(ws._userId);

			sockets.delete(ws);

			app.log.info(
				{ wsId: ws._wsId, code, reason: reason.toString() },
				"WS disconnected"
			);
		});

		ws.on("error", (err) => {
			app.log.warn({ wsId: ws._wsId, err }, "WS error");
		});
	});

	app.get("/ws-http-probe", async () => ({ ok: true, from: "wsPlugin" }));

	app.get("/ws-stats", async () => hub.stats());

});


