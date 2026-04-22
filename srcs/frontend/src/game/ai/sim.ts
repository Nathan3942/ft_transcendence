/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   sim.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:49 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/22 02:01:44 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
	Simule un jeu contre un bot simpliste pour evaluer chaque individue et lui donner une note de fitness
*/

import type { Genome } from "./type.js";
import type { PongConfig, PongInput, PongState } from "../pong_core.js";
import { DEFAULT_CONFIG, creatInitialState, updateCore } from "../pong_core.js";
import { makeAIPolicyP2, predictYWithBounces } from "./policy.js";

function emptyInput(): PongInput {
  return {
    p1: { up: false, down: false, start: false, togglePause: false },
    p2: { up: false, down: false, start: false, togglePause: false },
    p3: { up: false, down: false, start: false, togglePause: false },
    p4: { up: false, down: false, start: false, togglePause: false },
  };
}

// Baseline P1 simple: suit la balle quand elle arrive, sinon se recentre
function baselineP1(state: PongState): PongInput {
	const input = emptyInput();

	if (state.phase === "LOBBY") {
		input.p1.start = true;
		input.p2.start = true;
		return input;
	}

	if (state.phase !== "RUNNING")
		return input;

	const BALL_R = 10;
	const p1 = state.paddles[0];
	const center = state.playY + p1.pos + p1.len / 2;
	const ballGoingToP1 = state.ballVX < 0;

	let targetY: number;

	if (ballGoingToP1) {
		const paddleX = state.playX + BALL_R;
		const top = state.playY + BALL_R;
		const bottom = state.playY + state.playH - BALL_R;

		targetY = predictYWithBounces(
			state.ballX,
			state.ballY,
			state.ballVX,
			state.ballVY,
			paddleX,
			top,
			bottom
		);
	} else {
		const mid = state.playY + state.playH / 2;
		targetY = mid + (state.ballY - mid) * 0.2;
	}

	targetY = Math.max(
		state.playY + p1.len / 2,
		Math.min(state.playY + state.playH - p1.len / 2, targetY)
	);

	const dy = targetY - center;
	const deadZone = 10;

	if (Math.abs(dy) <= deadZone)
		return input;

	if (dy < 0)
		input.p1.up = true;
	else
		input.p1.down = true;

	return input;
}

export function evaluateGenome(genome: Genome, episodes: number, config?: Partial<PongConfig>): number {
	const cfg: PongConfig = { ...DEFAULT_CONFIG, ...config, winningScore: 5 };
	let total = 0;

	for (let ep = 0; ep < episodes; ep++) {
		const state = creatInitialState("1v1", 800, 600, cfg);

		const aiP2 = makeAIPolicyP2(genome);

		const dt = 1 / 120;
		const maxFrames = 60 * 120;

		let frames = 0;
		let touches = 0;
		let dirChanges = 0;

		let prevVX = state.ballVX;
		let prevDir: -1 | 0 | 1 = 0;

		for (; frames < maxFrames; frames++) {
			const p1In = baselineP1(state);
			const p2In = aiP2(state, dt);

			const input = emptyInput();
			input.p1 = p1In.p1;

			// P2: IA
			input.p2 = {
				...input.p2,
				up: p2In.p2.up,
				down: p2In.p2.down,
			};

			// start/pause: laisse baseline gérer start
			input.p1.start = p1In.p1.start;
			input.p2.start = p1In.p2.start; // on start aussi P2 pour être sûr

			// pénalité jitter (P2)
			const dir: -1 | 0 | 1 = input.p2.up ? -1 : input.p2.down ? 1 : 0;
			if (dir !== prevDir && dir !== 0 && prevDir !== 0)
				dirChanges++;
			prevDir = dir;

			prevVX = state.ballVX;

			updateCore(state, input, dt, cfg);

			// heuristique touche: vx passe de + à - (retour P2)
			if (prevVX > 0 && state.ballVX < 0 && state.phase === "RUNNING")
				touches++;

			if (state.phase === "GAMEOVER")
				break;

			// accélère la sim: si COUNTDOWN, on force la reprise (optionnel)
			if (state.phase === "COUNTDOWN") {
				state.phase = "RUNNING";
			}
		}

		const fitness =
			(state.scoreP2 * 3000)
			- (state.scoreP1 * 2000)
			+ (state.winner === 2 ? 10000 : 0)
			- (state.winner === 1 ? 5000 : 0)
			+ touches * 150
			- dirChanges * 10
			- frames * 0.2;

		total += fitness;
	}

	return total / episodes;
}

