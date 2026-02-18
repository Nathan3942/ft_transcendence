/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:45:30 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/18 16:25:39 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { FastifyBaseLogger } from "fastify";
import type { WsSocket } from "../ws/hub";
import type { GameId, GameState, PaddleInput, PlayerSlot } from "./types";
import { GameLoop } from "./gameLoop";
import { lookup } from "node:dns";

export class GameManager {
	
	private games = new Map<GameId, { state: GameState; loop: GameLoop }>();

	constructor(
		private log: FastifyBaseLogger, 
		private broadcastToRoom: (room: string, payload: any) => void
	) {}

	createGame(id: GameId) {
		if (this.games.has(id))
			return;

		const state: GameState = {
			id, 
			status: "waiting",
			score: { left: 0, right: 0 },
			ball: { x: 300, y: 300, vx: 200, vy: 120 },
			paddle: { left: { y: 300, vy: 0 }, right: { y: 300, vy: 0 } },
			lastTickMs: Date.now(), 
		};

		const loop = new GameLoop(
			state,
			(s) => this.broadcastToRoom(`game:${id}`, { type: "game_tick", state: s }),
			(evt) => this.broadcastToRoom(`game:${id}`, { type: "game_event", evt })
		);

		this.games.set(id, { state, loop });
	}

	joinGame(ws: WsSocket, gameId: GameId) {
		this.createGame(gameId);
		const g = this.games.get(gameId)!;

		ws.send(JSON.stringify({ type: "game_sync", state: g.state }));

		g.loop.start();
	}

	input(gameId: GameId, slot: PlayerSlot, input: PaddleInput) {
		const g = this.games.get(gameId);
		if (!g)
			return;
		g.loop.setInput(slot, input);
	}
}