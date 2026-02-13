/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   plugin.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/13 15:48:09 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/13 17:13:01 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
    branche socket sur fastify et expose le hub sur l'app
*/

import type WebSocket from "ws";
import websocketPlugin from "@fastify/websocket";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

import { WsHub, type WsSocket } from "./hub";
import type { WsClientEvent, WsEnvelope, WsRoom } from "./events";

type WsConnection = { socket: WebSocket };


// etend le type FastifyInstance pour l'ajouter au wsHub
declare module "fastify" {
    interface FasifyInstance {
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

    //active les websockets sur fastify
    await app.register(websocketPlugin);

    //cree le hub et lexpose sur fastify
    const hub = new WsHub(app.log);
    app.decorate("wsHub", hub);

    /* 
    	endpoint websocket 
		client co a l'url
		fastify passe la co de http a ws    
    */
	app.get("/ws", { websocket: true }, (connection, req) => {

		const ws = (connection as unknown as { socket: WebSocket }).socket as WsSocket;

		ws._wsId = randomId();

		app.log.info({ wsId: ws._wsId, ip: req.ip }, "WS connected");

		hub.join(ws, "global");

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

			if (msg.type === "subscibe") {
				hub.join(ws, msg.room as WsRoom);
				hub.send(ws, { type: "subscibed", room: msg.room });
				return;
			}

			if (msg.type === "unsubscribe") {
				hub.leave(ws, msg.room as WsRoom);
				hub.send(ws, { type: "unsubscibed", room: msg.room });
				return;
			}

			hub.send(ws, { type: "error", code: "UNKNOWN_EVENT", message: "Unknown event type" });
		});
		
		ws.on("close", () => {
			hub.leaveAll(ws);
			app.log.info({ wsId: ws._wsId }, "WS disconected");
		});

		ws.on("error", (err) => {
			app.log.warn({ wsId: ws._wsId, err }, "WS error");
		});
	});

	app.get("/ws-stats", async () => hub.stats());

});

function randomId(): string {
	const g: any = globalThis as any;
	if (g.crypto?.randomUUID)
		return (g.crypto.randomUUID());
	return (`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
}