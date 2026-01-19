/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   policy.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:52 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/19 14:48:59 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
    definie les regle de base du bot, ces regles dependent de la valeur de chaque gen
    un bot sur pong etant assez simpliste au niveau des input et de son environement, passer par un reseau de neuronne aurai ete overkill 
*/

import type { PongInput, PongState } from "../pong_core";
import { clamp } from "../pong_core";
import type { Genome } from "./type";

function emptyInput(): PongInput {
    return {
        p1: { up: false, down: false },
        p2: { up: false, down: false },
        p3: { up: false, down: false },
        p4: { up: false, down: false },
    };
}

export function makeAIPolicyP2(genome: Genome) {
    let reactAcc = 0;
    let lastDecision: -1 | 0 | 1 = 0;

    return (s: PongState, dt: number): PongInput => {
        const input = emptyInput();
        if (s.mod !== "1v1")
            return (input);

        //joue quand running
        if (s.phase !== "RUNNING") 
            return (input);

        //paddle P2 = index 1 dans init 1v1
        const p2 = s.paddles[1];
        const paddleCenter = p2.pos + p2.len / 2;

        //reaction (delay)
        reactAcc += dt; // approx peut passer dt
        if (reactAcc < genome.reaction) {
            // conserve derniere decision pour etre coherent
            if (lastDecision === -1)
                input.p2.up = true;
            if (lastDecision === 1)
                input.p2.down = true;
            return (input);
        }
        reactAcc = 0;

        // si la balle s'eloigne (vx < 0), on peut recentrer doucement
        const ballGoingToP2 = s.ballVX > 0;

        let targetY = s.playY + s.playH / 2;

        if (ballGoingToP2) {
            // position x du cote droite donc bord playfield
            const paddleX = s.playX + s.playW; // bord droit
            const distX = (paddleX - s.ballX);

            // temps avant d'atteindre le paddle droite (approx)
            const t = distX / Math.max(80, s.ballVX); // evite div 0 + limite

            // interseption 
            targetY = s.ballY + s.ballVY * t * genome.anticipation;

            // jitter (style plus humain)
            targetY += (Math.random() * 2 - 1) * genome.jitter;
            
            // erreur 
            if (Math.random() < genome.mistake) {
                targetY += (Math.random() * 2 - 1) * 120;
            }

            targetY = clamp(targetY, s.playY, s.playY + s.playH);
        }
        
        const dy = targetY - paddleCenter;

        // deadZone
        if (Math.abs(dy) <= genome.deadZone) {
            lastDecision = 0;
            return (input);
        }

        if (dy < 0) {
            input.p2.up = true;
            lastDecision = -1;
        }
        else {
            input.p2.down = true;
            lastDecision = 1;
        }
        return (input);
    };
}