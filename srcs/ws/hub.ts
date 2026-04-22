/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   hub.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/13 14:57:23 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/22 00:44:07 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
	routeur ws 
	enregistre quelle socket sont dans quelle room
*/

import type WebSocket from "ws";
import type { FastifyBaseLogger } from "fastify";
import type { WsRoom, WsServerEvent, WsEnvelope } from "./events";
import { GameSlot } from "./plugin";
import { StringValidation } from "zod/v3";



// sert a stocker id intern
export type WsSocket = WebSocket & {
    
    _wsId?: string;
    _userId?: number;
    _username?: string;
    _clientId?: string;
    _gameId?: string;
    _tournamentId?: string;
    //surment en garder que un au final a voir avec l'auth
    _slot?: GameSlot;
}

// envoie msg au socket
function safeSend(ws: WsSocket, data: string, log?: FastifyBaseLogger) {
    
    if ((ws as any).readyState === 1)
        ws.send(data);
    else
        log?.debug({ wsId: ws._wsId }, "WS send skipped: socket not open");
}


export class WsHub {

    private rooms = new Map<WsRoom, Set<WsSocket>>();
    private socketRooms = new Map<WsSocket, Set<WsRoom>>();

    constructor(private log: FastifyBaseLogger) {}

    // ajoute le socket dans une room
    join(ws: WsSocket, room: WsRoom) {

        if (!this.rooms.has(room))
            this.rooms.set(room, new Set());

        this.rooms.get(room)!.add(ws);

        if (!this.socketRooms.has(ws))
            this.socketRooms.set(ws, new Set());

        this.log.debug({ wsId: ws._wsId, room }, "WS join room");
    }

    //retire le socket dune room
    leave(ws: WsSocket, room: WsRoom) {

        this.rooms.get(room)?.delete(ws);
        this.socketRooms.get(ws)?.delete(room);

        if (this.rooms.get(room)?.size === 0)
            this.rooms.delete(room);
        if (this.socketRooms.get(ws)?.size === 0)
            this.socketRooms.delete(ws);

        this.log.debug({ wsId: ws._wsId, room }, "WS leave room");
    }

    // retire les socket de tte les rooms
    leaveAll(ws: WsSocket) {

        const set = this.socketRooms.get(ws);
        if (!set)
            return;

        for (const room of set) {
            this.rooms.get(room)?.delete(ws);
            if (this.rooms.get(room)?.size === 0)
				this.rooms.delete(room);
        }

		this.socketRooms.delete(ws);
		this.log.debug({ wsId: ws._wsId }, "WS leave all rooms");
    }

	//	broadcast qui envoie un event a tt les socket abonne a la room
	broadcast(room: WsRoom, event: WsEnvelope<WsServerEvent>) {

		const socket = this.rooms.get(room);
		if (!socket)
			return;

		const payload = JSON.stringify(event);
		for (const ws of socket)
			safeSend(ws, payload, this.log);
	}

	// evoie a un user, chaque user a sa room prive
	toUser(userId: string, event: WsEnvelope<WsServerEvent>) {

		this.broadcast(`user:${userId}`, event);
	}
	
	
	// evoie un event a un socket
	send(ws: WsSocket, event: WsEnvelope<WsServerEvent>) {

		safeSend(ws, JSON.stringify(event), this.log);
	}

	stats() {
		return {
			room: this.rooms.size,
			socketsTracked: this.socketRooms.size,
		};
	}

    count(room: WsRoom): number {
        return (this.rooms.get(room)?.size ?? 0);
    }
}