/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameLoop.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:45:48 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/18 12:37:56 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { GameState, PaddleInput, GameSlot, ModeId } from "./types";
import { randomSign, slotsForMode } from "./gameManager";
import { stat } from "fs";
import { getMatchStatus } from "../services/matchService";
import { wsPlugin } from "../ws";

const H = 750;
const W = 1000;
const H_CARRE = 800;
const W_CARRE = 800;
const BALL_R = 10;

const PADDLE_LEN = 120;
const PADDLE_SPEED = 500;
const PADDLE_THICK = 10;
const MARGIN = 10;
const GAP = PADDLE_THICK + 8
const TICK_MS = 10;

const WINNING_SCORE = 1;


function clamp(v: number, min: number, max: number) {
	return Math.max(min, Math.min(max, v));
}

function ballIntersectsRect(ballX: number, ballY: number, r: number, rect: { x: number; y: number; w: number; h: number }) {
	
	const closestX = clamp(ballX, rect.x, rect.x + rect.w);
	const closestY = clamp(ballY, rect.y, rect.y + rect.h);
	const dx = ballX - closestX;
	const dy = ballY - closestY;
	return dx * dx + dy * dy <= r * r;
}

function setBallSpeed(ball: { vx: number; vy: number }, targetSpeed: number) {
	
	const v = Math.hypot(ball.vx, ball.vy);
	if (v <= 1e-6) {
		ball.vx = targetSpeed;
		ball.vy = 0;
		return;
	}
	const k = targetSpeed / v;
	ball.vx *= k;
	ball.vy *= k;
}

export class GameLoop {
	
	private timer: NodeJS.Timeout | null = null;
	
	private inputs: Partial<Record<GameSlot, PaddleInput>> = {};

	constructor(
		private state: GameState,
		private onTick: (state: GameState) => void,
		private onEvent: (evt: any) => void
	) {}

	setInput(slot: GameSlot, input: PaddleInput) {
		const allowed = slotsForMode(this.state.mode);
		if (!allowed.includes(slot))
			return;
		this.inputs[slot] = input;
	}

	start() {

		console.log(`Playfield : x ${this.state.play.x}, y ${this.state.play.y}, w ${this.state.play.w}, h ${this.state.play.h}, \nBall: x ${this.state.ball.x}, y ${this.state.ball.y}`);
		
		if (this.timer)
			return;
		this.state.status = "running";
		this.state.lastTickMs = Date.now();

		for (const s of slotsForMode(this.state.mode)) {
			if (!this.inputs[s]) 
				this.inputs[s] = { dir: 0, ts: 0, esc: false };
		}

		this.timer = setInterval(() => this.step(), TICK_MS);
	}

	pause() {
		if (!this.timer)
			return;
		clearInterval(this.timer);
		this.timer = null;
		this.state.status = "paused";
	}

	resume() {
		if (this.timer)
			return;
		this.state.status = "running";
		this.state.phase = "COUNTDOWN";
		this.state.countdown = 3;
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
			
		// console.log(`pos paddle left: ${this.state.paddles.left?.pos}`)

		if (this.state.phase === "COUNTDOWN") {
			// console.log(`Countdown cda: ${this.state.countdownAcc}, cd: ${this.state.countdown}`);
			this.state.countdownAcc += dt;
			if (this.state.countdownAcc >= 1) {
				this.state.countdownAcc -= 1;
				this.state.countdown--;
				if (this.state.countdown <= 0) {
					this.state.phase = "RUNNING";
				}
			}
			this.onTick(this.state);
			return;
		}

		if (this.state.phase !== "RUNNING") {
			this.onTick(this.state);
			return;
		}

		// this.state.status = "running";

		let playX = 0;
		let playY = 0;
		let playW = 0;
		let playH = 0;

		if (this.state.mode === "1v1" || this.state.mode === "2v2") {
			playX = this.state.play?.x ?? 100;
			playY = this.state.play?.y ?? 100;
			playW = this.state.play?.w ?? W;
			playH = this.state.play?.h ?? H;
		}
		else {
			playX = this.state.play?.x ?? 100;
			playY = this.state.play?.y ?? 10;
			playW = this.state.play?.w ?? W_CARRE;
			playH = this.state.play?.h ?? H_CARRE;
		}

		this.updatePaddles(dt, playH, playW);

		this.state.ball.x += this.state.ball.vx * dt;
		this.state.ball.y += this.state.ball.vy * dt;

		this.wallBounce();

		const slots = slotsForMode(this.state.mode);
		for (const slot of slots) {
			const rect = this.paddleRect(slot, playX, playY, playW, playH);
			if (!rect)
				continue;

			if (ballIntersectsRect(this.state.ball.x, this.state.ball.y, BALL_R, rect)) {
				this.applyBounceFromPaddle(slot, rect);
				break;
			}
		}

		const scored = this.checkScore();
		if (scored && this.state.mode != "4p" && this.state.mode != "3p")
			this.applyScore(scored);
		else if (scored)
			this.applyScore4P();

		this.onTick(this.state);
	}

	private resetBall() {
		this.state.phase = "COUNTDOWN";
		this.state.countdown = 3;
		this.state.countdownAcc = 0;

		this.state.ball.x = this.state.play.w / 2 + this.state.play.x;
		this.state.ball.y = this.state.play.h / 2 + this.state.play.y;

		let vx = 0;
		let vy = 0;

		if (this.state.mode === "1v1" || this.state.mode === "2v2") {
			vx = 420 * randomSign(),
			vy = 420 * 0.6 * randomSign()
		}
		else {
			const r = Math.floor(Math.random() * 4);
			const r2 = Math.random();

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
		}
		
		this.state.ball.vx = vx;
		this.state.ball.vy = vy; 
	}

	private applyScore4P() {
		
		const slots: Array<"left" | "right" | "top" | "bottom"> = ["left", "right", "top", "bottom"];
		
		let standing = 4;
		
		for (const s of slots) {
			const p = this.state.paddles[s];
			if (!p)
				continue;
			const life = p.life ?? 0;

			if (life > 0)
				p.activate = true;
			else {
				p.activate = false;
				standing--;
			}
		}

		if (standing === 1) {
			for (const s of slots) {
				const p = this.state.paddles[s];
				if (p?.activate === true) {
					this.state.status = "ended";
					this.state.phase = "ENDED";
					this.state.winnerSlot = s;
					this.onEvent({ type: "game_over", winnerSlot: "left" });
					this.stop();
					return true;
				}
			}
		}
		this.resetBall();
	}

	private applyScore(player?: 1 | 2) {
		if (!player)
			return;

		if (player === 1) {
			this.state.score.left++;
			if (this.state.score.left >= WINNING_SCORE) {
				this.state.status = "ended";
				this.state.phase = "ENDED";
				this.state.winnerSlot = "left";
				this.onEvent({ type: "game_over", winnerSlot: "left" });
				this.stop();
				return true;
			}
		}
		else {
			this.state.score.right++;
			if (this.state.score.right >= WINNING_SCORE) {
				this.state.status = "ended";
				this.state.phase = "ENDED";
				this.state.winnerSlot = "right";
				this.onEvent({ type: "game_over", winnerSlot: "right" });
				this.stop();
				return true;
			}
		}

		this.resetBall();
	}

	private checkScore() {
		
		if (this.state.mode === "3p" || this.state.mode === "4p") {
			const left   = this.state.paddles["left"];
			const right  = this.state.paddles["right"];
			const top    = this.state.paddles["top"];
			const bottom = this.state.paddles["bottom"];

			if (this.state.ball.x <= this.state.play.x + BALL_R && left && (left.life ?? 0) > 0) {
				left.life!--;
				return 1;
			}

			if (this.state.ball.x >= this.state.play.x + this.state.play.w - BALL_R && right && (right.life ?? 0) > 0) {
				right.life!--;
				return 1;
			}

			if (this.state.ball.y <= this.state.play.y + BALL_R && top && (top.life ?? 0) > 0) {
				top.life!--;
				return 1;
			}

			if (this.state.ball.y >= this.state.play.y + this.state.play.h - BALL_R && bottom && (bottom.life ?? 0) > 0) {
				bottom.life!--;
				return 1;
			}

			return null;
		}
		else {
			const left  = this.state.play.x + BALL_R;
			const right = this.state.play.x + this.state.play.w - BALL_R;
			if (this.state.ball.x >= right)
				return 1;
			if (this.state.ball.x <= left) 
				return 2;
			return null;
		}
	}

	private wallBounce() {
		const top = this.state.play.y + BALL_R;
		const bottom = this.state.play.y + this.state.play.h - BALL_R;
		const left = this.state.play.x + BALL_R;
		const right = this.state.play.x + this.state.play.w - BALL_R;

		if (this.state.ball.y <= top) {
			this.state.ball.y = top;
			this.state.ball.vy *= -1;
		}
		if (this.state.ball.y >= bottom) {
			this.state.ball.y = bottom;
			this.state.ball.vy *= -1;
		}

		if (this.state.mode === "3p" || this.state.mode === "4p") {
			if (this.state.ball.x <= left) {
				this.state.ball.x = left;
				this.state.ball.vx *= -1;
			}
			if (this.state.ball.x >= right) {
				this.state.ball.x = right;
				this.state.ball.vx *= -1;
			}
		}
	}

	private updatePaddles(dt: number, playH: number, playW: number) {

		const slots = slotsForMode(this.state.mode);

		for (const slot of slots) {
			const paddle = this.state.paddles[slot];

			if (!paddle)
				continue;

			const input = this.inputs[slot] ?? { dir: 0, ts: 0 };

			paddle.vel = input.dir * PADDLE_SPEED;

			paddle.pos += paddle.vel * dt;

			if (paddle.axis === "y") {
				const min = 0;
				const max = playH - PADDLE_LEN;
				paddle.pos = clamp(paddle.pos, min, max);
			}
			else {
				const min = 0;
				const max = playW - PADDLE_LEN;
				paddle.pos = clamp(paddle.pos, min, max);
			}
		}
	}

	private paddleRect(slot: GameSlot, playX: number, playY: number, playW: number, playH: number) {
		const p = this.state.paddles[slot];
		if (!p || p.activate === false)
			return null;

		// p.pos est LOCAL au playfield (0..playH ou 0..playW)
		if (slot === "left") {
			return { x: playX + MARGIN, y: playY + p.pos, w: PADDLE_THICK, h: PADDLE_LEN };
		}
		if (slot === "right") {
			return { x: playX + playW - MARGIN - PADDLE_THICK, y: playY + p.pos, w: PADDLE_THICK, h: PADDLE_LEN };
		}

		// 2v2 lanes
		if (slot === "left1") {
			return { x: playX + MARGIN + 0 * GAP, y: playY + p.pos, w: PADDLE_THICK, h: PADDLE_LEN };
		}
		if (slot === "left2") {
			return { x: playX + MARGIN + 1 * GAP, y: playY + p.pos, w: PADDLE_THICK, h: PADDLE_LEN };
		}
		if (slot === "right1") {
			return { x: playX + playW - MARGIN - PADDLE_THICK - 0 * GAP, y: playY + p.pos, w: PADDLE_THICK, h: PADDLE_LEN };
		}
		if (slot === "right2") {
			return { x: playX + playW - MARGIN - PADDLE_THICK - 1 * GAP, y: playY + p.pos, w: PADDLE_THICK, h: PADDLE_LEN };
		}

		// top/bottom (axe x)
		if (slot === "top") {
			return { x: playX + p.pos, y: playY + MARGIN, w: PADDLE_LEN, h: PADDLE_THICK };
		}
		if (slot === "bottom") {
			return { x: playX + p.pos, y: playY + playH - MARGIN - PADDLE_THICK, w: PADDLE_LEN, h: PADDLE_THICK };
		}

		return null;
	}

	private applyBounceFromPaddle(slot: GameSlot, rect: { x: number; y: number; w: number; h: number }) {
		const max = 420;
		const ball = this.state.ball;

		const paddleCenterX = rect.x + rect.w / 2;
		const paddleCenterY = rect.y + rect.h / 2;

		if (slot === "left" || slot === "right" || slot === "left1" || slot === "left2" || slot === "right1" || slot === "right2") {
			const half = rect.h / 2;
			const hitY = clamp(ball.y, rect.y, rect.y + rect.h);
			let norm = (hitY - paddleCenterY) / half;
			norm = clamp(norm, -0.9, 0.9);

			// renvoyer vers l'intérieur
			ball.vx = Math.abs(ball.vx) * ((slot.startsWith("left")) ? 1 : -1);
			ball.vy = norm * max;
		} else {
			const half = rect.w / 2;
			const hitX = clamp(ball.x, rect.x, rect.x + rect.w);
			let norm = (hitX - paddleCenterX) / half;
			norm = clamp(norm, -0.9, 0.9);

			ball.vy = Math.abs(ball.vy) * (slot === "top" ? 1 : -1);
			ball.vx = norm * max;
		}

		setBallSpeed(ball, 420);
	}

}