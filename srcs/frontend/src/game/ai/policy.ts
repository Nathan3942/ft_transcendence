/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   policy.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:52 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/18 14:04:50 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
    definie les regle de base du bot, ces regles dependent de la valeur de chaque gen
    un bot sur pong etant assez simpliste au niveau des input et de son environement, passer par un reseau de neuronne aurai ete overkill 
*/


import type { PongInput, PongState } from "../pong_core.js";
import { clamp } from "../pong_core.js";
import type { Genome } from "./type.js";

const BALL_R = 10;

function emptyInput(): PongInput {
    return {
        p1: { up: false, down: false },
        p2: { up: false, down: false },
        p3: { up: false, down: false },
        p4: { up: false, down: false },
    };
}

function reflectY(y: number, top: number, bottom: number) {
	const H = bottom - top;
	if (H <= 0)
		return (top);
	
	const period = 2 * H;
	let v = y - top;
	v = ((v % period) + period) % period; // modulo positif
	if (v > H)
		v = period - v;
	return (top + v);
}

function predictYWithBounces(
	ballX: number,
	ballY: number,
	ballVX: number,
	ballVY: number,
	targetX: number,
	top: number,
	bottom: number
) {
	const dx = targetX - ballX;

	if ((dx > 0 && ballVX <= 0) || (dx < 0 && ballVX >= 0))
		return (ballY);

	const t = dx / ballVX;
	if (!isFinite(t) || t < 0)
		return (ballY);

	const naiveY = ballY + ballVY * t;
	return (reflectY(naiveY, top, bottom));
}



export function makeAIPolicyP2(genome: Genome) {
    let visionAcc = 1.0;
    let lastDecision: -1 | 0 | 1 = 0;

	let lastTargetY = 0; // cible memorise
	const stopEps = 2; // tolerence pixel

    return (s: PongState, dt: number): PongInput => {
        const input = emptyInput();
        if (s.mod !== "1v1")
            return (input);

        //joue quand running
        if (s.phase !== "RUNNING") 
            return (input);


		//1 hz
        visionAcc += dt; // approx peut passer dt

		//paddle P2 = index 1 dans init 1v1
        const p2 = s.paddles[1];
        const paddleCenter = s.playY + p2.pos + p2.len / 2;

        if (visionAcc < 1.0) {
			
			if (lastDecision !== 0) {
				const err = lastTargetY - paddleCenter;

				if (Math.abs(err) <= Math.max(stopEps, genome.deadZone)) {
					lastDecision = 0;
				} else {
					if ((lastDecision === 1  && err < 0) || (lastDecision === -1 && err > 0)) {
						lastDecision = 0;
					}
				}
			}

			// conserve derniere decision pour etre coherent
            if (lastDecision === -1)
                input.p2.up = true;
            if (lastDecision === 1)
                input.p2.down = true;
            return (input);
        }
		
        visionAcc = 0;
        

        // recentre si la balle seloigne
        const ballGoingToP2 = s.ballVX > 0;

        let targetY = s.playY + s.playH / 2;

        if (ballGoingToP2) {
			// ligne X du paddle droit (au bord du terrain)
			const paddleX = s.playX + s.playW - BALL_R;

			const top = s.playY + BALL_R;
			const bottom = s.playY + s.playH - BALL_R;

			// prédiction impact avec rebonds
			targetY = predictYWithBounces(
				s.ballX,
				s.ballY,
				s.ballVX,
				s.ballVY,
				paddleX,
				top,
				bottom
			);

			// anticipation en fonction du génome
			targetY = s.ballY + (targetY - s.ballY) * genome.anticipation;

			// jitter humain
			targetY += (Math.random() * 2 - 1) * genome.jitter;

			// erreur
			if (Math.random() < genome.mistake) {
				targetY += (Math.random() * 2 - 1) * 120;
			}

			// clamp sur centre atteignable du paddle
			targetY = clamp(
				targetY,
				s.playY + p2.len / 2,
				s.playY + s.playH - p2.len / 2
			);
		}

		lastTargetY = targetY;
        
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

