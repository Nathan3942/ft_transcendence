/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:45:30 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/10 16:31:50 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { FastifyBaseLogger } from "fastify";
import type { WsSocket } from "../ws/hub";
import type { GameId, GameState, PaddleInput, ModeId, GameSlot } from "./types";
import { GameLoop } from "./gameLoop";
import { deleteMatch, updateMatchStatus } from "../services/matchService";
import { match } from "assert";
import { TournamentMaganer } from "../tournament/tournamentManager";
import { getMatchById } from "../repository/matchesRepository";


const H = 750;
const W = 1000;
const H_CARRE = 800;
const W_CARRE = 800;
const PADDLE_H = 120;



type PlayerInfo = { clientId: string, userId?: number, username?: string };

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
				left: { axis: "y", pos: midY_carre, vel: 0, life: 3, activate: true },
				right: { axis: "y", pos: midY_carre, vel: 0, life: 3, activate: true },
				top: { axis: "x", pos: midX_carre, vel: 0, life: 3, activate: true },
				bottom: { axis: "x", pos: midX_carre, vel: 0, life: 0, activate: false },
			} as any;
		case "4p":
			return {
				left: { axis: "y", pos: midY_carre, vel: 0, life: 3, activate: true },
				right: { axis: "y", pos: midY_carre, vel: 0, life: 3, activate: true },
				top: { axis: "x", pos: midX_carre, vel: 0, life: 3, activate: true },
				bottom: { axis: "x", pos: midX_carre, vel: 0, life: 3, activate: true },
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

export function randomSign() {
	return Math.random() < 0.5 ? -1 : 1;
}

function initBall(mode: ModeId) {

	const SPEED = 420;

	if (mode === "1v1" || mode === "2v2") {
		return {
			x: W / 2 + 100,
			y: H / 2 + 100,
			vx: SPEED * randomSign(),
			vy: SPEED * 0.6 * randomSign()
		};
	}
	else {
		const r = Math.floor(Math.random() * 4);
		const r2 = Math.random();

		let vx = 0;
		let vy = 0;

		if (r === 0) {
			vx = 420;
			if (r2)
				vy = 420 * 0.6;
			else
				vy = -420 * 0.6;
		}
		else if (r === 1) {
			vx = -420;
			if (r2)
				vy = 420 * 0.6;
			else
				vy = -420 * 0.6;
		}
		else if (r === 2) {
			if (r2)
				vx = 420 * 0.6;
			else
				vx = -420 * 0.6;
			vy = 420;
		}
		else {
			if (r2)
				vx = 420 * 0.6;
			else
				vx = -420 * 0.6;
			vy = -420;
		}

		return {
			x: W_CARRE / 2 + 100,
			y: H_CARRE / 2 + 10,
			vx,
			vy
		};
	}
}




export class GameManager {
	
	private games = new Map<GameId, { state: GameState; loop: GameLoop; players: Players }>();

	constructor(
		private log: FastifyBaseLogger, 
		private broadcastToRoom: (room: string, payload: any) => void,
		private tournamentManager: TournamentMaganer
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
			phase: "LOBBY",
			countdownAcc: 0,
			countdown: 3,
		};

		const loop = new GameLoop(
			state,
			(s) => this.broadcastToRoom(`game:${id}`, { type: "game_tick", state: s }),
			(evt) => {
				if (evt.type === "game_over") {
					const winnerSlot = evt.winnerSlot as GameSlot;
					const winnerUserId = this.games.get(id)?.players[winnerSlot]?.clientId ?? null;
					
					updateMatchStatus(id, "finished");

					const match = getMatchById(id);
					
					this.broadcastToRoom(`game:${id}`, {
						type: "game_over",
						gameId: id,
						winnerSlot,
						winnerUserId,
						tournamentId: match?.tournamentId ?? null,
					});

					if (match?.tournamentId && winnerUserId) {
						const updatedBracket = this.tournamentManager.handleMatchFinished(
							String(match.tournamentId),
							Number(id),
							Number(winnerUserId)
						);

						this.broadcastToRoom(`tournament:${match.tournamentId}`, {
							type: "tournament_bracket_update",
							tournamentId: String(match.tournamentId),
							bracket: updatedBracket,
						});

						const result = this.tournamentManager.tryFinishTournament(String(match.tournamentId));

						if (result) {
							this.broadcastToRoom(`tournament:${match.tournamentId}`, {
								type: "tournament_finished",
								tournamentId: match.tournamentId,
								winnerName: result.winnerName,
								winnerId: result.winnerId
							});
						}
					}

					return;
				}
				
				this.broadcastToRoom(`game:${id}`, { type: "game_event", evt })
			}
		);


		this.games.set(id, { state, loop, players: {} });
	}

	getAndCreatGame(gameId: GameId, mode: ModeId) {
		
		this.createGame(gameId, mode);
		return this.games.get(gameId)!;
	}

	get(gameId: GameId) {
		return this.games.get(gameId);
	}

	joinGame(ws: WsSocket, gameId: GameId) {

		const g = this.games.get(gameId)!;
		if (!g)
			return;
		g.state.phase = "COUNTDOWN";
		g.state.countdown = 3;
		g.state.countdownAcc = 0;

		ws.send(JSON.stringify({ type: "game_sync", state: g.state }));
		g.loop.start();
	}

	pauseGame(gameId: GameId, reason: string, clientId: string, userId: string) {
		const g = this.games.get(gameId);
		if (!g)
			return;
		g.loop.pause();
		console.log(`Pause: reason ${userId}, ${clientId}`);
		this.broadcastToRoom(`game:${gameId}`, { type: "game_paused", reason,  clientId, userId });
		this.broadcastToRoom(`game:${gameId}`, { type: "game_tick", state: g.state });
	}

	resumeGame(gameId: GameId) {
		const g = this.games.get(gameId);
		if (!g)
			return;
		g.loop.resume();
		this.broadcastToRoom(`game:${gameId}`, { type: "game_resumed" });
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

	registerPlayer(gameId: GameId, slot: GameSlot, clientId: string, userId?: number, username?: string) {

		const game = this.games.get(gameId)!;
		game.players[slot] = { clientId, userId, username };
		console.log(`\n\nUserid : ${userId}\n\n`);
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