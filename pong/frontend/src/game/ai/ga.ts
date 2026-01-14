/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ga.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:55 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/14 16:14:36 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Genome, GAConfig } from "./type";

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
        out.jitter = Math.min(30, Math.min(0, n(out.jitter)));
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


export async function evolv(cfg: GAConfig, evaluate: (g: Genome) => Promise<number>) {
	
	let pop = Array.from({ length: cfg.popSize }, randomGenome);

	let best = pop[0];
	let bestFit = -Infinity;

	for (let gen = 0; gen < cfg.generation; gen++) {
		const scored = await Promise.all(pop.map(async g => ({ g, f: await evaluate(g) })));
		scored.sort((x, y) => y.f - x.f);

		if (scored[0].f > bestFit) {
			bestFit = scored[0].f;
			best = scored[0].g;
		}

		const eliteCount = Math.max(1, Math.floor(cfg.popSize * cfg.elitism));
		const elite = scored.slice(0, eliteCount).map(x => x.g);

		const next: Genome[] = [...elite];

		while (next.length < cfg.popSize) {
			//selection simple en tournoi
			const pick = () => scored[Math.floor(Math.random() * Math.min(20, scored.length))].g;

			const child = mutate(crossover(pick(), pick()), cfg.mutationRate, cfg.mutationSigma);
			next.push(child);
		}

		pop = next;
	}

	return { best, bestFit};
}