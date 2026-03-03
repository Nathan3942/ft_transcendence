/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:46:01 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/03 10:04:19 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { number } from "zod";

export type GameId = string;


export type ModeId = "1v1" | "2v2" | "3p" | "4p";

export type GameSlot =
  | "left"
  | "right"
  | "left1"
  | "left2"
  | "right1"
  | "right2"
  | "top"
  | "bottom";

export type GamePhase = "LOBBY" | "COUNTDOWN" | "RUNNING" | "ENDED";

export type GameStatus = "waiting" | "running" | "paused" | "ended";

export type PaddleInput = {
	dir: -1 | 0 | 1; // -1 up, 0 stop, 1 down
	ts: number; // client timestamp
}

export type PaddleState = {
	axis: "y" | "x";
	pos: number;
	vel: number;
	life: number;
	activate: boolean;
}

export type GameState = {
	id: GameId;
	status: GameStatus;
	mode: ModeId;
	score: { left: number; right: number };
	ball: { x: number; y: number; vx: number; vy: number };
	paddles: Partial<Record<GameSlot, PaddleState>>;
	lastTickMs: number;
	play: { x: number; y: number; w: number; h: number };

	winnerSlot?: GameSlot | null;

	phase: GamePhase;
	countdownAcc: number;
	countdown: number;
	// winnerName?: string | null;

	// initPaddles: (mode: ModeId) => PaddleState[];
	// checkScore: () => 1 | 2 | null;
	// handleWallBounce: () => void;
};




// export type GameId = string;
// export type PlayerSlot = "left" | "right";

// export type PaddleInput = {
// 	dir: -1 | 0 | 1; // -1 up, 0 stop, 1 down
// 	ts: number; // client timestamp
// }

// type PaddleSide = "LEFT" | "RIGHT" | "TOP" | "BOTTOM";

// type Paddle = {
// 	side:	PaddleSide;
// 	pos:	number;
// 	len:	number;
// 	thick:	number;
// 	lane?:	number;
// 	life:	number;
// 	activate:	boolean;
// };

// export type GameState = {
// 	id: GameId;
// 	status: "waiting" | "running" | "ended";
// 	score: { left: number; right: number };

// 	ball: { x: number; y: number; vx: number; vy: number, speed: number };
// 	paddles: Paddle[];

// 	lastTickMs: number;
// 	play: { x: number; y: number; w: number; h: number };
// };

// export type PongConfig = {
// 	ballRadius:		number;
// 	paddleSpeed:	number;
// 	ballSpeed:		number;
// 	paddleWidth:	number;
// 	paddleHeight:	number;
// 	paddleMargin:	number;
// 	winningScore:	number;
// };


// export const DEFAULT_CONFIG: PongConfig = {
// 	ballRadius:		10,
// 	paddleSpeed:	600,
// 	ballSpeed:		420,
// 	paddleWidth:	10,
// 	paddleHeight:	150,
// 	paddleMargin:	10,
// 	winningScore:	1,
// };