/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:46:01 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/27 11:18:12 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type GameId = string;
export type PlayerSlot = "left" | "right";

export type PaddleInput = {
	dir: -1 | 0 | 1; // -1 up, 0 stop, 1 down
	ts: number; // client timestamp
}

export type GameState = {
	id: GameId;
	status: "waiting" | "running" | "ended";
	mode: "1v1" | "2v2" | "3p" | "4p";
	score: { left: number; right: number };

	ball: { x: number; y: number; vx: number; vy: number };
	paddle: {
		left: { y: number; vy: number };
		right: { y: number; vy: number };
	};

	lastTickMs: number;
	play?: { x: number; y: number; w: number; h: number };
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