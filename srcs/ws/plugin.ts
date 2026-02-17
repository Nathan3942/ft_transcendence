/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   plugin.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/13 15:48:09 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/17 17:29:45 by njeanbou         ###   ########.fr       */
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
import { wsAuthenticate } from "./auth";

type WsConnection = { socket: WebSocket };


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


export const wsPlugin: FastifyPluginAsync = fp(async (app) => {

	app.log.info("✅ wsPlugin loaded");
    //active les websockets sur fastify
    await app.register(websocket);

    //cree le hub et lexpose sur fastify
    const hub = new WsHub(app.log);
    app.decorate("wsHub", hub);

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
		hub.join(ws, `user:${ws._userId}`);

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

			hub.send(ws, { type: "error", code: "UNKNOWN_EVENT", message: "Unknown event type" });
		});
		

		ws.on("close", (code, reason) => {
			hub.leaveAll(ws);
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

function randomId(): string {
	const g: any = globalThis as any;
	if (g.crypto?.randomUUID)
		return (g.crypto.randomUUID());
	return (`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
}