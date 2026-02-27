/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameLoop.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:45:48 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/27 09:24:11 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { GameState, PaddleInput, PlayerSlot } from "./types";

const H = 700;
const PADDLE_SPEED = 500;
const TICK_MS = 10;

export class GameLoop {
	
	private timer: NodeJS.Timeout | null = null;
	private inputs: Record<PlayerSlot, PaddleInput> = {
		left: { dir: 0, ts: 0},
		right: { dir: 0, ts: 0},
	};

	constructor(
		private state: GameState,
		private onTick: (state: GameState) => void,
		private onEvent: (evt: any) => void
	) {}

	setInput(slot: PlayerSlot, input: PaddleInput) {
		this.inputs[slot] = input;
	}

	start() {
		if (this.timer)
			return;
		this.state.status = "running";
		this.state.lastTickMs = Date.now();

		

		this.timer = setInterval(() => this.step(), TICK_MS);
	}

	stop() {
		if (!this.timer)
			return;
		clearInterval(this.timer);
		this.timer = null;
		this.state.status = "ended";
	}

	private step() {
		const now = Date.now();
		const dt = (now - this.state.lastTickMs) / 1000;
		this.state.lastTickMs = now;

		this.state.paddle.left.vy = this.inputs.left.dir * PADDLE_SPEED;
		this.state.paddle.right.vy = this.inputs.right.dir * PADDLE_SPEED;

		this.state.paddle.left.y += this.state.paddle.left.vy * dt;
		this.state.paddle.right.y += this.state.paddle.right.vy * dt;

		this.state.paddle.left.y = Math.max(0, Math.min(H, this.state.paddle.left.y));
		this.state.paddle.right.y = Math.max(0, Math.min(H, this.state.paddle.right.y));

		// TODO: ball phisic score

		this.onTick(this.state);
	}

	// private PaddleGestion(dt: number) {
	// 	this.state.paddle.left.vy = this.inputs.left.dir * PADDLE_SPEED;
	// 	this.state.paddle.right.vy = this.inputs.right.dir * PADDLE_SPEED;

	// 	this.state.paddle.left.y += this.state.paddle.left.vy * dt;
	// 	this.state.paddle.right.y += this.state.paddle.right.vy * dt;

	// 	this.state.paddle.left.y = Math.max(0, Math.min(H - 150, this.state.paddle.left.y));
	// 	this.state.paddle.right.y = Math.max(0, Math.min(H - 150, this.state.paddle.right.y));
	// }

	// private handleWallBounce() {
	// 	const top = this.state.play?.y + 10;
	// 	const bottom = this.state.play.y + this.state.play.h - 10;

	// 	if (this.state.ball.y <= top) {
	// 		this.state.ball.y = top;
	// 		this.state.ball.vy *= -1;
	// 	}
	// 	if (this.state.ball.y >= bottom) {
	// 		this.state.ball.y = bottom;
	// 		this.state.ball.vy *= -1;
	// 	}
	// }

	// private ballIntersectsPaddle() {
		
	// }

	// applyBounceFromPaddle() {
	// 	const max = this.state.ball.speed * 1.0;
	// 	const half = 120 / 2;
	// 	if (half <= 1e-6)
	// 		return;
	
	// 	// balle playfield
	// 	const localBallX = this.state.ball.x - this.state.play.x;
	// 	const localBallY = this.state.ball.y - this.state.play.y;
	
	// 	const center = p.pos + half;
	
	// 	if (p.side === "LEFT" || p.side === "RIGHT") {
	// 		const hit = clamp(localBallY, p.pos, p.pos + p.len);
	// 		let norm = (hit - center) / half;
	// 		norm = clamp(norm, -0.9, 0.9);
	
	// 		state.ballVX = Math.abs(state.ballVX) * (p.side === "LEFT" ? 1 : -1);
	// 		state.ballVY = norm * max;
	// 	} else {
	// 		const hit = clamp(localBallX, p.pos, p.pos + p.len);
	// 		let norm = (hit - center) / half;
	// 		norm = clamp(norm, -0.9, 0.9);
	
	// 		state.ballVY = Math.abs(state.ballVY) * (p.side === "TOP" ? 1 : -1);
	// 		state.ballVX = norm * max;
	// 	}
	
	// 	setBallSpeed(state, cfg.ballSpeed);
	// }

	// private step() {
	// 	const now = Date.now();
	// 	const dt = (now - this.state.lastTickMs) / 1000;
	// 	this.state.lastTickMs = now;

	// 	this.PaddleGestion(dt);

	// 	this.state.ball.x += this.state.ball.vx * dt;
	// 	this.state.ball.y += this.state.ball.vy * dt;

	// 	this.handleWallBounce();

	// 	for (const p of this.state.paddle) {
	// 			if (p.activate === false)
	// 				continue;
	// 			const r = paddleReact(p, state, cfg);
	// 			if (ballIntersectsRect(state.ballX, state.ballY, cfg.ballRadius, r)) {
	// 				applyBounceFromPaddle(state, p, cfg);
	// 				//att au 4p pour les colision paddle
	// 				break;
	// 			}
	// 	}

	// 	// TODO: ball phisic score

	// 	this.onTick(this.state);
	// }
}