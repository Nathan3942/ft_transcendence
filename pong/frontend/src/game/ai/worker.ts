/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   worker.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:43 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/19 16:33:28 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// <reference lib="webworker" />

import type { GAConfig, Genome } from "./type";
import { evolve } from "./ga";
import { evaluateGenome } from "./sim";

type TrainMsg = { type: "train"; cfg: GAConfig };
type StopMsg = { type: "stop" };
type Incoming = TrainMsg | StopMsg;

let shouldStop = false;

self.onmessage = (e: MessageEvent<Incoming>) => {
	const msg = e.data;

	if (msg.type === "stop") {
		shouldStop = true;
		return;
	}

	if (msg.type === "train") {
		shouldStop = false;
		const gaCfg = msg.cfg;

		const best = train(gaCfg);

		(self as any).postMessage({ type: "done", bestGenome: best.best, bestFitness: best.bestFit });
	}
};

function train(cfg: GAConfig) {
	let lastSentGen = -1;

	const res = evolve(
		cfg,
		(g: Genome) => {
			if (shouldStop) return (-1e18);
			return (evaluateGenome(g, cfg.episodesPerGenome));
		},
		(p) => {
			// throttle: envoie tous les 1 gen (ou mets 2/5)
			if (p.gen !== lastSentGen) {
				lastSentGen = p.gen;
				(self as any).postMessage({ type: "progress", ...p });
			}
		}
	);

	return (res);
}