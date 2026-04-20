/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   worker.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:43 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/20 02:18:07 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
	Entrainement de mon bot en appelant evolve et avec des message de debug
*/

/// <reference lib="webworker" />

import type { GAConfig, Genome } from "./type.js";
import { evolve } from "./ga.js";
import { evaluateGenome } from "./sim.js";

type TrainMsg = { type: "train"; cfg: GAConfig };
type StopMsg = { type: "stop" };
type Incoming = TrainMsg | StopMsg;

let shouldStop = false;

function post(msg: any) {
	(self as any).postMessage(msg);
}

self.onmessage = (e: MessageEvent<Incoming>) => {
	const msg = e.data;

	if (msg.type === "stop") {
		shouldStop = true;
		post({ type: "debug", msg: "stop received" });
		return;
	}

	if (msg.type !== "train") return;

	shouldStop = false;
	post({ type: "debug", msg: "train received" });

	try {
		const res = evolve(
			msg.cfg,
			(g: Genome) => {
				if (shouldStop)
					return -1e18;
				return evaluateGenome(g, msg.cfg.episodesPerGenome);
			},
			(p) => {
				// p = { gen, bestFitness, bestGenome }
				post({ type: "progress", ...p });
			}
		);

		post({ type: "done", bestGenome: res.best, bestFitness: res.bestFit });
	} catch (err: any) {
		console.error("WORKER TRAIN ERROR:", err);
		post({
			type: "error",
			msg: String(err?.stack ?? err?.message ?? err),
		});
	}
};

