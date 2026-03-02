/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameLoop.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:45:48 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/02 19:55:27 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { GameState, PaddleInput, GameSlot, ModeId } from "./types";
import { slotsForMode } from "./gameManager";

const H = 700;
const W = 1000;
const H_CARRE = 800;
const W_CARRE = 800;

const PADDLE_LEN = 120;
const PADDLE_SPEED = 500;
const TICK_MS = 10;

function clamp(v: number, min: number, max: number) {
	return Math.max(min, Math.min(max, v));
}

function axisForSlot(slot: GameSlot): "y" | "x" {
	return slot === "top" || slot === "bottom" ? "x" : "y";
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
		if (this.timer)
			return;
		this.state.status = "running";
		this.state.lastTickMs = Date.now();

		for (const s of slotsForMode(this.state.mode)) {
			if (!this.inputs[s])
				this.inputs[s] = { dir: 0, ts: 0 };
		}

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

		this.state.ball.x += this.state.ball.vx * dt;
		this.state.ball.y += this.state.ball.vy * dt;

		// TODO: ball phisic score
		this.onTick(this.state);
	}

}