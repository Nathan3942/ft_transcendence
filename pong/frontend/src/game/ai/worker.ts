/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   worker.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:43 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/26 11:51:48 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
	Entrainement de mon bot en appelant evolve et avec des message de debug
*/

/// <reference lib="webworker" />

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
		(self as any).postMessage({ type: "debug", msg: "stop received" });
		return;
	}

	if (msg.type === "train") {
    	shouldStop = false;
    	(self as any).postMessage({ type: "debug", msg: "train received" });
		
		try {
      		const res = evolve(
        	msg.cfg,
        	(g: Genome) => {
          		if (shouldStop) return -1e18;
          			return evaluateGenome(g, msg.cfg.episodesPerGenome);
        	},
        	(p) => {
        		(self as any).postMessage({ type: "progress", ...p });
        	}
      	);

      	(self as any).postMessage({ type: "done", bestGenome: res.best, bestFitness: res.bestFit });
    	} catch (err: any) {
			console.error("WORKER TRAIN ERROR:", err);
			(self as any).postMessage({
				type: "error",
				msg: String(err?.stack ?? err?.message ?? err),
			});
		}
  	}
};



// import type { GAConfig, Genome } from "./type";
// import { evolve } from "./ga";
// import { evaluateGenome } from "./sim";

// type TrainMsg = { type: "train"; cfg: GAConfig };
// type StopMsg = { type: "stop" };
// type Incoming = TrainMsg | StopMsg;

// let shouldStop = false;

// self.onmessage = (e: MessageEvent<Incoming>) => {
// 	console.log("FROM WORKER:", e.data);
// 	const msg = e.data;

// 	if (msg.type === "stop") {
// 		shouldStop = true;
// 		return;
// 	}

// 	if (msg.type === "train") {
// 		shouldStop = false;
// 		const gaCfg = msg.cfg;

// 		const best = train(gaCfg);

// 		(self as any).postMessage({ type: "done", bestGenome: best.best, bestFitness: best.bestFit });
// 	}
// };

// function train(cfg: GAConfig) {
// 	let lastSentGen = -1;

// 	const res = evolve(
// 		cfg,
// 		(g: Genome) => {
// 			if (shouldStop) return (-1e18);
// 			return (evaluateGenome(g, cfg.episodesPerGenome));
// 		},
// 		(p) => {
// 			// throttle: envoie tous les 1 gen (ou mets 2/5)
// 			if (p.gen !== lastSentGen) {
// 				lastSentGen = p.gen;
// 				(self as any).postMessage({ type: "progress", ...p });
// 			}
// 		}
// 	);

// 	return (res);
// }