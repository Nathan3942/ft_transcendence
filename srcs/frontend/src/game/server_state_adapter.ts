/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server_state_adapter.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/23 17:28:04 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/24 17:40:22 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type ServerGameState = {
	
	id: string;
	status: "waiting" | "running" | "finished";
	score: { left: number; right: number };
	ball: { x: number; y: number; vx: number; vy: number };
	paddle: {
		left: { y: number; vy: number };
		right: { y: number; vy: number };
	};
	play?: { x: number; y: number; w: number; h: number };
};


export type RenderState1v1 = {
	
	playX: number; playY: number; playW: number; playH:number;
	ballX: number; ballY: number;
	paddleLeftY: number;
	paddleRightY: number;
	scoreLeft: number;
	scoreRight: number;
	phase: "LOBBY" | "RUNNING" | "PAUSED" | "COUNTDOWN" | "GAMEOVER";
};

export function toRenderState(s: ServerGameState, canvasW: number, canvasH: number): RenderState1v1 {

	const playX = s.play?.x ?? Math.floor(canvasW * 0.11);
	const playY = s.play?.y ?? Math.floor(canvasH * 0.14);
	const playW = s.play?.w ?? Math.floor(canvasW * 0.78);
	const playH = s.play?.h ?? Math.floor(canvasH * 0.78);

  return {
    playX, playY, playW, playH,
    ballX: s.ball.x,
    ballY: s.ball.y,
    paddleLeftY: s.paddle.left.y,
    paddleRightY: s.paddle.right.y,
    scoreLeft: s.score.left,
    scoreRight: s.score.right,
    phase: s.status === "running" ? "RUNNING" : "LOBBY",
  };
}