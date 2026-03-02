/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:45:30 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/02 19:55:54 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { FastifyBaseLogger } from "fastify";
import type { WsSocket } from "../ws/hub";
import type { GameId, GameState, PaddleInput, ModeId, GameSlot } from "./types";
import { GameLoop } from "./gameLoop";


const H = 700;
const W = 1000;
const H_CARRE = 800;
const W_CARRE = 800;
const PADDLE_H = 120;

type PlayerInfo = { clientId: string, userId?: string };

type Players = Partial<Record<GameSlot, PlayerInfo>>;

export function slotsForMode(mode: ModeId): GameSlot[] {
	
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


function initPaddles(mode: ModeId) {

	const midY = H / 2 - PADDLE_H / 2;
	const midY_carre = H_CARRE / 2 - PADDLE_H / 2;
	const midX_carre = W_CARRE / 2 - PADDLE_H / 2;

	switch (mode) {
		case "2v2":
			return {
				left1: { axis: "y", pos: midY, vel: 0 },
				left2: { axis: "y", pos: midY, vel: 0 },
				right1: { axis: "y", pos: midY, vel: 0 },
				right2: { axis: "y", pos: midY, vel: 0 },
			};
		case "3p":
			return {
				left: { axis: "y", pos: midY_carre, vel: 0 },
				right: { axis: "y", pos: midY_carre, vel: 0 },
				top: { axis: "x", pos: midX_carre, vel: 0 },
			} as any;
		case "4p":
			return {
				left: { axis: "y", pos: midY_carre, vel: 0 },
				right: { axis: "y", pos: midY_carre, vel: 0 },
				top: { axis: "x", pos: midX_carre, vel: 0 },
				bottom: { axis: "x", pos: midX_carre, vel: 0 },
			} as any;
		default:
			return {
				left: { axis: "y", pos: midY, vel: 0 },
  				right: { axis: "y", pos: midY, vel: 0 },
			};
	}
}

function initPlay(mode: ModeId) {
	
	if (mode === "1v1" || mode === "2v2") {
		return { x: 100, y: 100, w: W, h: H };
	}
	else {
		return { x: 100, y: 10, w: 800, h: 800 };
	}
}

function randomSign() {
	return Math.random() < 0.5 ? -1 : 1;
}

function initBall(mode: ModeId) {

	// ajouter random pour debut de partie sur vx vy
	if (mode === "1v1" || mode === "2v2") {
		return { x: W / 2 + 100, y: H / 2 + 100, vx: 420 * randomSign(), vy: 420 * 0.6 * randomSign() };
	}
	else {
		return { x: W_CARRE / 2 + 100, y: H_CARRE / 2 + 10, vx: 420 * randomSign(), vy: 420 * 0.6 * randomSign() };
	}
}


export class GameManager {
	
	private games = new Map<GameId, { state: GameState; loop: GameLoop; players: Players }>();

	constructor(
		private log: FastifyBaseLogger, 
		private broadcastToRoom: (room: string, payload: any) => void
	) {}

	createGame(id: GameId, md: ModeId) {
		
		if (this.games.has(id))
			return;

		const state: GameState = {
			id, 
			status: "waiting",
			mode: md,
			score: { left: 0, right: 0 },
			ball: initBall(md),
			paddles: initPaddles(md),
			lastTickMs: Date.now(), 
			play: initPlay(md),
		};

		const loop = new GameLoop(
			state,
			(s) => this.broadcastToRoom(`game:${id}`, { type: "game_tick", state: s }),
			(evt) => this.broadcastToRoom(`game:${id}`, { type: "game_event", evt })
		);


		this.games.set(id, { state, loop, players: {} });
	}

	getAndCreatGame(gameId: GameId, mode: ModeId) {
		
		this.createGame(gameId, mode);
		return this.games.get(gameId)!;
	}

	joinGame(ws: WsSocket, gameId: GameId) {

		const g = this.games.get(gameId)!;
		if (!g)
			return;
		ws.send(JSON.stringify({ type: "game_sync", state: g.state }));
		g.loop.start();
	}

	resetGameState(game: GameState, width: number, height: number) {

		game.ball.x = W / 2;
		game.ball.y = H / 2;
		game.ball.vx = 0;
		game.ball.vy = 0;

		game.paddles = initPaddles(game.mode);

		game.status = "waiting"; // ou countdown
		game.play = initPlay(game.mode);

		// return (game);
	}

	input(gameId: GameId, slot: GameSlot, input: PaddleInput) {
		
		const g = this.games.get(gameId);
		if (!g)
			return;
		g.loop.setInput(slot as any, input);
	}

	registerPlayer(gameId: GameId, slot: GameSlot, clientId: string, userId?: string) {

		const game = this.games.get(gameId)!;
		game.players[slot] = { clientId, userId };
	}

	isCurentPlayer(gameId: GameId, slot: "left" | "right", clientId: string): boolean {

		const game = this.games.get(gameId);
		return (game?.players[slot]?.clientId === clientId);
	}

	isRegistered(gameId: GameId, clientId: string): boolean {
		const g = this.games.get(gameId);
		if (!g)
			return false;

		for (const s of slotsForMode(g.state.mode)) {
		if (g.players[s]?.clientId === clientId) return true;
		}
		return false;
	}
}