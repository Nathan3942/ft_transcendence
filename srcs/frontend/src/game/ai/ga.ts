/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ga.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:55 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/19 16:33:29 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* 
	regroupe les fonction relative a la gestion de la population
	- randomGenome : attribue des gen aleatoire a chaque individue pour la premiere generation
	- mutate : modifie aleatoirement un gen dun individue pour pousser a l'evolution
	- crossover : pour chaque enfant dune nouvelle generation choisi aleatoirement pour chaque gen entre ses 2 parant (les parant etant les 2 meilleur a la generation precedente)
	-  evolve : a la fin dune generation une fois que les fitness sont calcule, resort les meilleur individue et fait une nouvelle generation avec comme base ces deux meilleur individue
*/

import type { Genome, GAConfig, TrainProgress } from "./type";

function clamp01(x: number) {
	return (Math.max(0, Math.min(1, x)));
}

export function randomGenome(): Genome {
    return {
        anticipation: Math.random(),
        reaction: Math.random() * 0.25,
        deadZone: Math.random() * 60,
        mistake: Math.random() * 0.25,
        jitter: Math.random() * 30,
    };
}

function mutate(g: Genome, rate: number, sigma: number): Genome {
    const n = (x: number) => x + (Math.random() * 2 - 1) * sigma;

    const out: Genome = { ...g };
    if (Math.random() < rate)
        out.anticipation = Math.min(1, Math.max(0, n(out.anticipation)));
    if (Math.random() < rate)
        out.reaction = Math.min(0.25, Math.max(0, n(out.reaction)));
    if (Math.random() < rate)
        out.deadZone = Math.min(60, Math.max(0, n(out.deadZone)));
    if (Math.random() < rate)
        out.mistake = Math.min(0.25, Math.max(0, n(out.mistake)));
    if (Math.random() < rate)
        out.jitter = Math.min(30, Math.max(0, n(out.jitter)));
    return (out);
}


function crossover(a: Genome, b: Genome): Genome {
    // uniform crossover
    return {
        anticipation:	Math.random() < 0.5 ? a.anticipation : b.anticipation,
        reaction:		Math.random() < 0.5 ? a.reaction : b.reaction,
		deadZone:		Math.random() < 0.5 ? a.deadZone : b.deadZone,
		mistake:		Math.random() < 0.5 ? a.mistake : b.mistake,
		jitter:			Math.random() < 0.5 ? a.jitter : b.jitter,
    };
}

function tournament<T>(arr: T[], score: (t: T) => number, k = 5): T {
	let best = arr[(Math.random() * arr.length) | 0];
	let bestS = score(best);
	for (let i = 1; i < k; i++) {
		const cand = arr[(Math.random() * arr.length) | 0];
		const s = score(cand);
		if (s > bestS) {
			best = cand;
			bestS = s;
		}
	}
	return (best);
}

export function evolve(cfg: GAConfig, evaluate: (g: Genome) => number, onProgress?: (p: TrainProgress) => void) {
	let pop: Genome[] = Array.from({ length: cfg.popSize }, randomGenome);

	let best = pop[0];
	let bestFit = -Infinity;

	for (let gen = 0; gen < cfg.generation; gen++) {
		const scored = pop.map((g) => ({ g, f: evaluate(g) }));
		scored.sort((x, y) => y.f - x.f);

		if (scored[0].f > bestFit) {
			bestFit = scored[0].f;
			best = scored[0].g;
		}

		onProgress?.({ gen, bestFitness: bestFit, bestGenome: best });

		const elitCount = Math.max(1, Math.floor(cfg.popSize * cfg.elitism));
		const elite = scored.slice(0, elitCount).map((x) => x.g);

		const next: Genome[] = [...elite];

		const scoreFn = (g: Genome) => scored.find((x) => x.g === g)?.f ?? -Infinity;

		while (next.length < cfg.popSize) {
			const a = tournament(elite.length ? elite : pop, scoreFn, 5);
			const b = tournament(elite.length ? elite : pop, scoreFn, 5);
			const child = mutate(crossover(a, b), cfg.mutationRate, cfg.mutationSigma);
			next.push(child);
		}

		pop = next;
	}
	return { best, bestFit };
}