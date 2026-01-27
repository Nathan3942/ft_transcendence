/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   policy.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:52 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/27 10:27:29 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
    definie les regle de base du bot, ces regles dependent de la valeur de chaque gen
    un bot sur pong etant assez simpliste au niveau des input et de son environement, passer par un reseau de neuronne aurai ete overkill 
*/


import type { PongInput, PongState } from "../pong_core";
import { clamp } from "../pong_core";
import type { Genome } from "./type";

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
    let visionAcc = 0;
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
        

        // si la balle s'eloigne (vx < 0), on peut recentrer doucement
        const ballGoingToP2 = s.ballVX > 0;

        let targetY = s.playY + s.playH / 2;

        if (ballGoingToP2) {
			// ligne X du paddle droit (au bord du terrain)
			const paddleX = s.playX + s.playW - BALL_R;

			// bornes rebond (comme handleWallBounce : top/bottom avec ballRadius)
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

			// anticipation = “sur/sous-corrige” en fonction du génome
			// (1 = exact, <1 sous anticipe, >1 sur anticipe)
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



// import type { PongInput, PongState } from "game/pong_core";
// import { clamp } from "game/pong_core";
// import type { Genome } from "./type";


// function emptyInput(): PongInput {
//     return {
//         p1: { up: false, down: false },
//         p2: { up: false, down: false },
//         p3: { up: false, down: false },
//         p4: { up: false, down: false },
//     };
// }


// export function makeAIPolicyP2(genome: Genome) {
//   let visionAcc = 0;

//   // dernière décision appliquée entre deux "vues"
//   let lastDecision: -1 | 0 | 1 = 0;

//   // snapshot de la vue (ce que l'IA a le droit de connaître)
//   let seen = {
//     ballX: 0,
//     ballY: 0,
//     ballVX: 0,
//     ballVY: 0,
//     playX: 0,
//     playY: 0,
//     playW: 0,
//     playH: 0,
//     paddleLen: 0,
//   };

//   return (s: PongState, dt: number): PongInput => {
//     const input = emptyInput();
//     if (s.mod !== "1v1") return input;
//     if (s.phase !== "RUNNING") return input;

//     visionAcc += dt;

//     // applique la dernière décision tant qu'on n'a pas le droit de "voir"
//     if (visionAcc < 1.0) {
//       if (lastDecision === -1) input.p2.up = true;
//       if (lastDecision === 1) input.p2.down = true;
//       return input;
//     }

//     // 1 seconde écoulée : nouvelle "vue"
//     visionAcc = 0;

//     // snapshot (l’IA "voit" l’état maintenant)
//     const p2 = s.paddles[1];
//     seen = {
//       ballX: s.ballX,
//       ballY: s.ballY,
//       ballVX: s.ballVX,
//       ballVY: s.ballVY,
//       playX: s.playX,
//       playY: s.playY,
//       playW: s.playW,
//       playH: s.playH,
//       paddleLen: p2.len,
//     };

//     // décision ultra simple (sans anticipation rebond)
//     const paddleCenter = s.playY + p2.pos + p2.len / 2;
//     const targetY = seen.playY + seen.playH / 2; // recentre baseline

//     const dy = targetY - paddleCenter;
//     if (Math.abs(dy) <= genome.deadZone) {
//       lastDecision = 0;
//       return input;
//     }
//     if (dy < 0) {
//       lastDecision = -1;
//       input.p2.up = true;
//     } else {
//       lastDecision = 1;
//       input.p2.down = true;
//     }
//     return input;
//   };
// }












// function predictYWithBounces(
//   ballX: number,
//   ballY: number,
//   ballVX: number,
//   ballVY: number,
//   targetX: number,
//   top: number,
//   bottom: number
// ) {
//   // si la balle ne va pas vers targetX, on renvoie ballY
//   const dx = targetX - ballX;
//   if ((dx > 0 && ballVX <= 0) || (dx < 0 && ballVX >= 0)) return ballY;

//   const t = dx / ballVX;
//   if (!isFinite(t) || t < 0) return ballY;

//   // position y "naïve"
//   let y = ballY + ballVY * t;

//   const H = bottom - top;
//   if (H <= 0) return ballY;

//   // miroir sur [top,bottom] : simulate rebonds
//   // on ramène y dans un espace 0..2H puis on reflète
//   const y0 = y - top;
//   const period = 2 * H;
//   let m = ((y0 % period) + period) % period;
//   if (m > H) m = period - m;
//   return top + m;
// }


// const p2 = s.paddles[1];
// const paddleX = s.playX + s.playW - 1; // bord droit approx (suffit)
// const top = s.playY + 0 + 0; // le handleWallBounce utilise ballRadius, donc:
// const bottom = s.playY + s.playH;

// // mieux: inclure ballRadius pour coller à la physique
// const topR = s.playY + 10;                 // cfg.ballRadius si accessible
// const bottomR = s.playY + s.playH - 10;

// let targetY = s.playY + s.playH / 2;

// if (seen.ballVX > 0) {
//   targetY = predictYWithBounces(
//     seen.ballX, seen.ballY, seen.ballVX, seen.ballVY,
//     paddleX,
//     topR, bottomR
//   );

//   // bruit selon génome
//   targetY += (Math.random() * 2 - 1) * genome.jitter;
//   if (Math.random() < genome.mistake) {
//     targetY += (Math.random() * 2 - 1) * 120;
//   }

//   // clamp au centre atteignable
//   targetY = clamp(
//     targetY,
//     s.playY + p2.len / 2,
//     s.playY + s.playH - p2.len / 2
//   );
// }















// const VIEW_PERIOD = 1.0;
// const BALL_R = 10;

// type PlayerId = 1 | 2 | 3 | 4;
// type PaddleSide = "LEFT" | "RIGHT" | "TOP" | "BOTTOM";

// /*
//     simule les rebonds sur un intervalle min max
//     en repliant la coordonnee (mouvement miroir) pour simuler des bounces parfaits
// */

// function reflectInRange(x: number, min: number, max: number) {
//     const L = max - min;
//     if (L <= 0)
//         return (min);
//     const p = 2 * L;

//     let u = x - min;
//     u = ((u % p) + p) % p;
//     if (u > L)
//         u = p - u; // miroir
//     return (min + u);
// }

// /*
// 	predit la coordonne "moving" (Y ou X) au temps t en simulant des rebond sur min max sur l'axe
// */

// function predict1D(pos: number, vel: number, t: number, min: number, max: number) {
//     const raw = pos + vel * t;
//     return (reflectInRange(raw, min, max));
// }




// import type { PongInput, PongState } from "../pong_core";
// import { clamp } from "../pong_core";
// import type { Genome } from "./type";

// function emptyInput(): PongInput {
//     return {
//         p1: { up: false, down: false },
//         p2: { up: false, down: false },
//         p3: { up: false, down: false },
//         p4: { up: false, down: false },
//     };
// }

// export function makeAIPolicyP2(genome: Genome) {
//     let reactAcc = 0;
//     let lastDecision: -1 | 0 | 1 = 0;

//     return (s: PongState, dt: number): PongInput => {
//         const input = emptyInput();
//         if (s.mod !== "1v1")
//             return (input);

//         //joue quand running
//         if (s.phase !== "RUNNING") 
//             return (input);

//         //paddle P2 = index 1 dans init 1v1
//         const p2 = s.paddles[1];
//         const paddleCenter = s.playY + p2.pos + p2.len / 2;

//         //reaction (delay)
//         reactAcc += dt; // approx peut passer dt
//         if (reactAcc < genome.reaction) {
//             // conserve derniere decision pour etre coherent
//             if (lastDecision === -1)
//                 input.p2.up = true;
//             if (lastDecision === 1)
//                 input.p2.down = true;
//             return (input);
//         }
//         reactAcc = 0;

//         // si la balle s'eloigne (vx < 0), on peut recentrer doucement
//         const ballGoingToP2 = s.ballVX > 0;

//         let targetY = s.playY + s.playH / 2;

//         if (ballGoingToP2) {
//             // position x du cote droite donc bord playfield
//             const paddleX = s.playX + s.playW; // bord droit
//             const distX = (paddleX - s.ballX);

//             // temps avant d'atteindre le paddle droite (approx)
//             const t = distX / Math.max(80, s.ballVX); // evite div 0 + limite

//             // interseption 
//             targetY = s.ballY + s.ballVY * t * genome.anticipation;

//             // jitter (style plus humain)
//             targetY += (Math.random() * 2 - 1) * genome.jitter;
            
//             // erreur 
//             if (Math.random() < genome.mistake) {
//                 targetY += (Math.random() * 2 - 1) * 120;
//             }

//             targetY = clamp(targetY, s.playY, s.playY + s.playH);
//         }
        
//         const dy = targetY - paddleCenter;

//         // deadZone
//         if (Math.abs(dy) <= genome.deadZone) {
//             lastDecision = 0;
//             return (input);
//         }

//         if (dy < 0) {
//             input.p2.up = true;
//             lastDecision = -1;
//         }
//         else {
//             input.p2.down = true;
//             lastDecision = 1;
//         }
//         return (input);
//     };
// }


// import type { PongInput, PongState } from "../pong_core";
// import { clamp } from "../pong_core";
// import type { Genome } from "./type";

// const VIEW_PERIOD = 1.0; // 1 vue / seconde (contrainte)
// const BALL_R = 10;       // doit matcher cfg.ballRadius (DEFAULT_CONFIG=10)

// function emptyInput(): PongInput {
//   return {
//     p1: { up: false, down: false },
//     p2: { up: false, down: false },
//     p3: { up: false, down: false },
//     p4: { up: false, down: false },
//   };
// }

// type PlayerId = 1 | 2 | 3 | 4;
// type PaddleSide = "LEFT" | "RIGHT" | "TOP" | "BOTTOM";

// /**
//  * Reflection helper: simule les rebonds sur un intervalle [min,max]
//  * en repliant la coordonnée (mouvement miroir) pour simuler des bounces parfaits.
//  */
// function reflectInRange(x: number, min: number, max: number) {
//   const L = max - min;
//   if (L <= 0) return min;
//   const p = 2 * L;

//   let u = x - min;
//   u = ((u % p) + p) % p; // modulo positif
//   if (u > L) u = p - u;  // miroir
//   return min + u;
// }

// /**
//  * Prédit la coordonnée "moving" (Y ou X) au temps t en simulant des rebonds
//  * sur [min,max] sur cet axe.
//  */
// function predict1D(pos: number, vel: number, t: number, min: number, max: number) {
//   const raw = pos + vel * t;
//   return reflectInRange(raw, min, max);
// }

// /**
//  * Fabrique une policy IA "1 vue / seconde" pour un joueur donné.
//  * playerId correspond à p1/p2/p3/p4 dans PongInput.
//  *
//  * Important : pour être cohérent, le playerId doit correspondre au paddle voulu.
//  * En 1v1 : p1 = paddle index 0, p2 = paddle index 1.
//  * En 4p : p1=LEFT idx0, p2=RIGHT idx1, p3=TOP idx2, p4=BOTTOM idx3.
//  */
// export function makeAIPolicy(genome: Genome, playerId: PlayerId) {
//   let visionAcc = 0;

//   // dernière décision appliquée entre deux vues
//   let lastDecision: -1 | 0 | 1 = 0;

//   // snapshot autorisé (IA "voit" uniquement à 1Hz)
//   let seenBallX = 0;
//   let seenBallY = 0;
//   let seenBallVX = 0;
//   let seenBallVY = 0;

//   // snapshot terrain
//   let seenPlayX = 0;
//   let seenPlayY = 0;
//   let seenPlayW = 0;
//   let seenPlayH = 0;

//   // snapshot paddle
//   let seenSide: PaddleSide = "RIGHT";
//   let seenPaddlePos = 0; // local (0..playH ou 0..playW)
//   let seenPaddleLen = 0;

//   function setDecision(input: PongInput, dir: -1 | 0 | 1) {
//     lastDecision = dir;

//     const key = playerId === 1 ? "p1" : playerId === 2 ? "p2" : playerId === 3 ? "p3" : "p4";
//     if (dir === -1) input[key].up = true;
//     if (dir === 1) input[key].down = true;
//   }

//   return (s: PongState, dt: number): PongInput => {
//     const input = emptyInput();

//     // IA active seulement pendant RUNNING
//     if (s.phase !== "RUNNING") return input;

//     // playerId -> paddle index (mapping standard de ton core)
//     const idx = playerId - 1;
//     const p = s.paddles[idx];
//     if (!p || !p.activate) return input;

//     // Compte le temps depuis la dernière "vue"
//     visionAcc += dt;

//     // Entre deux vues : on rejoue la dernière décision (sans relire l’état)
//     if (visionAcc < VIEW_PERIOD) {
//       setDecision(input, lastDecision);
//       return input;
//     }

//     // Nouvelle vue (1 fois/sec)
//     visionAcc = 0;

//     // Snapshot autorisé
//     seenBallX = s.ballX;
//     seenBallY = s.ballY;
//     seenBallVX = s.ballVX;
//     seenBallVY = s.ballVY;

//     seenPlayX = s.playX;
//     seenPlayY = s.playY;
//     seenPlayW = s.playW;
//     seenPlayH = s.playH;

//     seenSide = p.side as PaddleSide;
//     seenPaddlePos = p.pos;
//     seenPaddleLen = p.len;

//     // Bords utiles (on inclut BALL_R pour coller au core)
//     const left = seenPlayX + BALL_R;
//     const right = seenPlayX + seenPlayW - BALL_R;
//     const top = seenPlayY + BALL_R;
//     const bottom = seenPlayY + seenPlayH - BALL_R;

//     // Centre actuel paddle en coord global
//     let paddleCenterGlobal = 0;

//     // Cible (global) à atteindre (Y pour LEFT/RIGHT, X pour TOP/BOTTOM)
//     let target = 0;

//     // --- Cas LEFT/RIGHT : le paddle se déplace en Y ---
//     if (seenSide === "LEFT" || seenSide === "RIGHT") {
//       paddleCenterGlobal = seenPlayY + seenPaddlePos + seenPaddleLen / 2;

//       // recentrage par défaut
//       target = seenPlayY + seenPlayH / 2;

//       const paddleX = (seenSide === "LEFT") ? left : right;
//       const dx = paddleX - seenBallX;

//       // balle vient vers ce paddle ?
//       const goingToThis =
//         (seenSide === "RIGHT" && seenBallVX > 0 && dx > 0) ||
//         (seenSide === "LEFT"  && seenBallVX < 0 && dx < 0);

//       if (goingToThis) {
//         // temps avant d'atteindre la ligne du paddle
//         const t = dx / seenBallVX; // vx a le bon signe ici

//         // prédiction Y au temps t en simulant rebonds haut/bas
//         target = predict1D(seenBallY, seenBallVY, t * genome.anticipation, top, bottom);

//         // humanisation
//         target += (Math.random() * 2 - 1) * genome.jitter;
//         if (Math.random() < genome.mistake) {
//           target += (Math.random() * 2 - 1) * 120;
//         }

//         // clamp au centre atteignable par le paddle
//         target = clamp(
//           target,
//           seenPlayY + seenPaddleLen / 2,
//           seenPlayY + seenPlayH - seenPaddleLen / 2
//         );
//       }

//       const dy = target - paddleCenterGlobal;

//       if (Math.abs(dy) <= genome.deadZone) {
//         setDecision(input, 0);
//         return input;
//       }
//       setDecision(input, dy < 0 ? -1 : 1);
//       return input;
//     }

//     // --- Cas TOP/BOTTOM : le paddle se déplace en X ---
//     // TOP/BOTTOM : p.pos est local sur X (0..playW)
//     paddleCenterGlobal = seenPlayX + seenPaddlePos + seenPaddleLen / 2;

//     // recentrage par défaut
//     target = seenPlayX + seenPlayW / 2;

//     const paddleY = (seenSide === "TOP") ? top : bottom;
//     const dyToLine = paddleY - seenBallY;

//     // balle vient vers ce paddle ?
//     const goingToThis =
//       (seenSide === "BOTTOM" && seenBallVY > 0 && dyToLine > 0) ||
//       (seenSide === "TOP"    && seenBallVY < 0 && dyToLine < 0);

//     if (goingToThis) {
//       const t = dyToLine / seenBallVY; // vy a le bon signe ici

//       // prédiction X au temps t en simulant rebonds gauche/droite
//       target = predict1D(seenBallX, seenBallVX, t * genome.anticipation, left, right);

//       // humanisation
//       target += (Math.random() * 2 - 1) * genome.jitter;
//       if (Math.random() < genome.mistake) {
//         target += (Math.random() * 2 - 1) * 120;
//       }

//       // clamp au centre atteignable
//       target = clamp(
//         target,
//         seenPlayX + seenPaddleLen / 2,
//         seenPlayX + seenPlayW - seenPaddleLen / 2
//       );
//     }

//     const dxMove = target - paddleCenterGlobal;

//     if (Math.abs(dxMove) <= genome.deadZone) {
//       setDecision(input, 0);
//       return input;
//     }
//     setDecision(input, dxMove < 0 ? -1 : 1);
//     return input;
//   };
// }
