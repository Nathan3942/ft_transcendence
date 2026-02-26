/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:45:30 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/26 07:25:32 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { FastifyBaseLogger } from "fastify";
import type { WsSocket } from "../ws/hub";
import type { GameId, GameState, PaddleInput, PlayerSlot } from "./types";
import { GameLoop } from "./gameLoop";
import { lookup } from "node:dns";


const H = 700;
const W = 1000;
const PADDLE_H = 120;

type Players = {
	left?: { clientId: string, userId?: string };
	right?: { clientId: string, userId?: string };
}


export class GameManager {
	
	private games = new Map<GameId, { state: GameState; loop: GameLoop; players: Players }>();

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
			ball: { x: (W / 2) + 100, y: (H / 2) + 100, vx: 200, vy: 120 },
			paddle: { left: { y: H / 2 - PADDLE_H / 2, vy: 0 }, right: { y: H / 2 - PADDLE_H / 2, vy: 0 } },
			lastTickMs: Date.now(), 
			play: { x: 100, y: 100, w: W, h: H },
		};

		const loop = new GameLoop(
			state,
			(s) => this.broadcastToRoom(`game:${id}`, { type: "game_tick", state: s }),
			(evt) => this.broadcastToRoom(`game:${id}`, { type: "game_event", evt })
		);


		this.games.set(id, { state, loop, players: {} });
	}

	joinGame(ws: WsSocket, gameId: GameId) {
		// this.createGame(gameId);
		const g = this.games.get(gameId)!;

		ws.send(JSON.stringify({ type: "game_sync", state: g.state }));

		g.loop.start();
	}

	resetGameState(game: GameState, width: number, height: number) {

		game.ball.x = W / 2;
		game.ball.y = H / 2;
		game.ball.vx = 0;
		game.ball.vy = 0;

		game.paddle.left.y = H / 2 - PADDLE_H / 2;
		game.paddle.right.y = H / 2 - PADDLE_H / 2;

		game.paddle.left.vy = 0;
		game.paddle.right.vy = 0;

		game.status = "waiting"; // ou countdown
		game.play = { x: width / 10, y: height / 10, w: width, h: height};

		// return (game);
	}

	input(gameId: GameId, slot: PlayerSlot, input: PaddleInput) {
		
		const g = this.games.get(gameId);
		if (!g)
			return;
		g.loop.setInput(slot, input);
	}

	registerPlayer(gameId: GameId, slot: "left" | "right", clientId: string, userId?: string) {

		const game = this.games.get(gameId)!;
		game.players[slot] = { clientId, userId };
	}

	isCurentPlayer(gameId: GameId, slot: "left" | "right", clientId: string): boolean {
		const game = this.games.get(gameId);
		return (game?.players[slot]?.clientId === clientId);
	}

	getAndCreatGame(gameId: GameId) {
		this.createGame(gameId);
		return this.games.get(gameId)!;
	}

	IsRegister(gameId: GameId, clientId: string): boolean {
		if (clientId === this.games.get(gameId)?.players.left?.clientId || clientId === this.games.get(gameId)?.players.left?.clientId)
			return (true);
		else
			return (false);
	}
}