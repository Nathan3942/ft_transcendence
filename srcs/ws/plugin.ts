/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   plugin.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/13 15:48:09 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/03 10:34:00 by njeanbou         ###   ########.fr       */
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
import { updateMatchStatus } from "../services/matchService";
import { getMatchById } from "../repository/matchesRepository";


export type ModeStr = "1v1" | "2v2" | "3p" | "4p";

type Slot1v1 = "left" | "right";
type Slot2v2 = "left1" | "left2" | "right1" | "right2";
type Slot3p = "left" | "right" | "top";
type Slot4p = "left" | "right" | "top" | "bottom";

export type GameSlot = Slot1v1 | Slot2v2 | Slot3p | Slot4p;


// etend le type FastifyInstance pour l'ajouter au wsHub
declare module "fastify" {
  interface FastifyInstance {
    wsHub: WsHub;
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
function pickSlotForClient(game: any, mode: ModeStr, clientId: string): GameSlot | null {
  const slots = slotsForMode(mode);

  // 1) Reconnect : le clientId existe déjà -> on lui redonne son slot
  for (const s of slots) {
    if (game.players?.[s]?.clientId === clientId) return s;
  }

  // 2) Nouveau joueur : premier slot vide
  for (const s of slots) {
    if (!game.players?.[s]?.clientId) return s;
  }

  return null;
}

function countRegisteredPlayers(game: any, mode: ModeStr): number {
  const slots = slotsForMode(mode);
  let c = 0;
  for (const s of slots) {
    if (game.players?.[s]?.clientId) c++;
  }
  return c;
}

function randomId(): string {
  const g: any = globalThis as any;
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}


export const wsPlugin: FastifyPluginAsync = fp(async (app) => {

	app.log.info("✅ wsPlugin loaded");
    //active les websockets sur fastify
    await app.register(websocket);

    //cree le hub et lexpose sur fastify
    const hub = new WsHub(app.log);
    app.decorate("wsHub", hub);

	const gameManager = new GameManager(app.log, (room, payload) => hub.broadcast(room as any, payload));

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

		ws._wsId = randomId();

		// const auth = wsAuthenticate(req);
		// if (!auth.ok) {
		// 	app.log.warn({ wsId: ws._wsId, reason: auth.reason }, "WS auth failed");
		// 	// 1008 = policy violation
		// 	ws.close(1008, "Unauthorized");
		// 	return;
		// }

		// ws._userId = auth.userId;

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
				
					const target = msg.room.slice("user:".length);
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
				return;
			}

			if (msg.type === "join_game") {
				
				const room = `game:${msg.gameId}` as WsRoom;
				ws._gameId = msg.gameId;

				const match = getMatchById(msg.gameId);
				const mode = normalizeMode(match?.mode);

				const game = gameManager.getAndCreatGame(msg.gameId, mode);

				ws._clientId = msg.clientId;
				

				const slot = pickSlotForClient(game, mode, ws._clientId);

				if (!slot) {

					hub.send(ws, { type: "match_full", gameId: msg.gameId });
					setTimeout(() => {
						try {
						ws.close(1008, "Match full");
						} catch {}
					}, 30);
					return;
				}

				ws._slot = slot;

				gameManager.registerPlayer(msg.gameId, slot, ws._clientId, ws._userId);

				hub.join(ws, room);
				
				hub.send(ws, { type: "assigned_slot", gameId: msg.gameId, slot, mode });

				const count = countRegisteredPlayers(game, mode);
        		const playerNeeded = slotsForMode(mode).length;

		
				if (count < playerNeeded) {
					hub.send(ws, { type: "match_waiting", gameId: msg.gameId, count, playerNeeded, mode });
					return;
				}
				else {
					if (game.state.status === "paused")
						gameManager.resumeGame(msg.gameId);
				}
				
				updateMatchStatus(msg.gameId, "in_progress");
				hub.broadcast(room, { type: "match_ready", gameId: msg.gameId, count, mode });

				gameManager.joinGame(ws, msg.gameId);

				return;
			}

			if (msg.type === "input") {

				gameManager.input(msg.gameId, msg.slot as any, msg.input as any);
				return;
			}

			if (msg.type === "leave_game") {
				const room = `game:${msg.gameId}` as WsRoom;
				hub.leave(ws, room);
				console.log("leave game");
				if (ws._slot && ws._clientId)
					gameManager.pauseGame(msg.gameId, ws._clientId);
				return;
			}

			hub.send(ws, { type: "error", code: "UNKNOWN_EVENT", message: "Unknown event type" });
		});
		

		ws.on("close", (code, reason) => {
			hub.leaveAll(ws);

			const gameId = ws._gameId;
			const slot = ws._slot;

			if (gameId && slot)
				gameManager.pauseGame(gameId, `disconnect:${slot}`, ws._clientId);

			app.log.info({ wsId: ws._wsId, code, reason: reason.toString() }, "WS disconnected");
		});	

		// ws.on("close", () => {
		// 	hub.leaveAll(ws);
		// 	app.log.info({ wsId: ws._wsId }, "WS disconected");
		// });

		ws.on("error", (err) => {
			app.log.warn({ wsId: ws._wsId, err }, "WS error");
		});
	});

	app.get("/ws-http-probe", async () => ({ ok: true, from: "wsPlugin" }));

	app.get("/ws-stats", async () => hub.stats());

});


