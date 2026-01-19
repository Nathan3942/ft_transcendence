/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   sim.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:49 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/19 16:33:30 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
	Simule un jeu contre un bot simpliste pour evaluer chaque individue et lui donner une note de fitness
*/

import type { Genome } from "./type";
import type { PongConfig, PongInput, PongState } from "../pong_core";
import { DEFAULT_CONFIG, creatInitialState, updateCore } from "../pong_core";
import { makeAIPolicyP2 } from "./policy";

// bot baseline pour p1
function makeBaselineP1() {
	let last: -1 | 0 | 1 = 0;

	return (state: any, _dt: number): PongInput => {
		const input: PongInput = {
			p1: { up: false, down: false, start: false, togglePause: false },
			p2: { up: false, down: false, start: false, togglePause: false },
			p3: { up: false, down: false },
			p4: { up: false, down: false },
		};

		if (state.phase === "LOBBY") {
			input.p1.start = true;
			return (input);
		}

		if (state.phase !== "RUNNING") 
			return (input);

		const p1 = state.paddle[0];
		const paddleCenter = p1.pos + (p1.len / 2);

		// baseline simple suit la balle si elle va vers lui si non se recentre
		const target = state.ballVX < 0 ? state.ballY : (state.playY + state.playH / 2);
		const dy = target - paddleCenter;

		if (Math.abs(dy) < 10) {
			last = 0;
			return (input);
		}
		if (dy < 0) {
			input.p1.up = true
			last = -1;
		} else {
			input.p1.down = true;
			last = 1;
		}
		return (input);
	};
}

export type simResult = {
	fitness: number;
	winner:	1 | 2 | 3 | 4 | null;
	frames: number;
	touches: number;
	dirChanges: number;
};

export function evaluateGenome(genome: Genome, episodes: number, config?: Partial<PongConfig>): number {
	const cfg: PongConfig = { ...DEFAULT_CONFIG, ...config, winningScore: 5 };

	let totalFitness = 0;

	for (let ep = 0; ep < episodes; ep++) {
		const state = creatInitialState("1v1", 800, 600, cfg);

		const aiP2 = makeAIPolicyP2(genome);
		const botP1 = makeBaselineP1();

		const dt = 1 / 120; 		// sim dt rapide
		const maxFrames = 60 * 120; // 60s max

		let frames = 0;
		let touches = 0;
		let prevVX = state.ballVX;
		let prevDir: -1 | 0 | 1 = 0;
		let dirChanges = 0;

		// demarrage immediat
		let started = false;

		for (; frames < maxFrames; frames++) {
			const p1Input = botP1(state, dt);
			const p2Input = aiP2(state, dt);

			const input: PongInput = {
				p1: p1Input.p1,
				p2: p2Input.p2,
				p3: { up: false, down: false },
				p4: { up: false, down: false },
			};

			// start auto si lobby
			if (!started && state.phase === "LOBBY") {
				input.p1.start = true;
				input.p2.start = true;
			} else {
				started = true;
			}

			// penalite pour changement de direction
			const dir: -1 | 0 | 1 = input.p2.up ? -1 : input.p2.down ? 1 : 0;
			if (dir !== prevDir && dir !== 0 && prevDir !== 0)
				dirChanges++;
			prevDir = dir;

			prevVX = state.ballVX;
			updateCore(state, input, dt, cfg);
			if (prevVX > 0 && state.ballVX < 0 && state.phase === "RUNNING") {
				touches++;
			}
			if (state.phase === "GAMEOVER")
				break;
		}

		/* 
		Fitness rules
		- bonus if winning : 5000
		- +1 per frame alive
		- +200 per touche
		- -5 per change of direction
		*/

		const winBonus = state.winner === 2 ? 5000 : state.winner === 1 ? -1000 : 0;
		const fitness = frames + touches * 200 + winBonus - dirChanges * 5;

		totalFitness += fitness;
	}

	return (totalFitness / episodes);
}