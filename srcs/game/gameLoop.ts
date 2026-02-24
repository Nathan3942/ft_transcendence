/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameLoop.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:45:48 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/24 18:23:14 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { GameState, PaddleInput, PlayerSlot } from "./types";

const H = 600;
const PADDLE_SPEED = 500;
const TICK_MS = 50;

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
}