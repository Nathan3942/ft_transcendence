/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server_state_adapter.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/23 17:28:04 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/02 19:48:23 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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

export type ServerPaddle = {
	axis: "x" | "y";
	pos: number;
	vel: number;
}

export type ServerGameState = {
	
	id: string;
	status: "waiting" | "running" | "finished";
	mode: ModeId;

	score: { left: number; right: number };
	ball: { x: number; y: number; vx: number; vy: number };

	paddles: Partial<Record<GameSlot, ServerPaddle>>;
	
	play?: { x: number; y: number; w: number; h: number };
};


export type RenderPaddleRect = {
	slot: GameSlot;
	x: number;
	y: number;
	w: number;
	h: number;
};

export type RenderState = {
	mode: ModeId;
	playX: number; playY: number; playW: number; playH: number;

	ballX: number; ballY: number;
	scoreLeft: number; scoreRight: number;

	phase: "LOBBY" | "RUNNING";
	paddles: RenderPaddleRect[];
}

const PADDLE_THICK = 10;
const PADDLE_LEN = 120;
const MARGIN = 10;

const GAP = PADDLE_LEN + 8;

function axisLocalToAbs(
  axis: "x" | "y",
  pos: number,
  playX: number,
  playY: number
) {
  return axis === "y" ? (playY + pos) : (playX + pos);
}

function slotsForMode(mode: ModeId): GameSlot[] {
	switch (mode) {
		case "2v2":
			return ["left1", "left2", "right1", "right2"];
		case "3p":
			return ["left", "right", "top"];
		case "4p":
			return ["left", "right", "top", "bottom"];
		default:
			return ["left", "right"];
	}
}


export function toRenderState(s: ServerGameState, canvasW: number, canvasH: number): RenderState {

	let playX = s.play?.x ?? Math.floor(canvasW * 0.11);
	let playY = s.play?.y ?? Math.floor(canvasH * 0.14);
	let playW = s.play?.w ?? Math.floor(canvasW * 0.80);
	let playH = s.play?.h ?? Math.floor(canvasH * 0.80);

	if (s.mode === "3p" || s.mode === "4p") {
		playW = 800;
		playH = 800;
		playY = 10;
		// playW = 700;
		// playH = 700;
	}

	console.log(`State = ${playW}, ${playH}, ${playX}, ${playY}`);

	const paddles: RenderPaddleRect[] = [];

	const wantedSlot = slotsForMode(s.mode);
	for (const slot of wantedSlot) {
		const p = s.paddles?.[slot];
		if (!p)
			continue;
		
		const abs = axisLocalToAbs(p.axis, p.pos, playX, playY);

		if (slot === "left")
			paddles.push({ slot, x: playX + MARGIN, y: abs, w: PADDLE_THICK, h: PADDLE_LEN });
		else if (slot === "right")
			paddles.push({ slot, x: playX + playW - MARGIN - PADDLE_THICK, y: abs, w: PADDLE_THICK, h: PADDLE_LEN });
		else if (slot === "left1")
			paddles.push({ slot, x: playX + MARGIN + 0 * GAP, y: abs, w: PADDLE_THICK, h: PADDLE_LEN });
		else if (slot === "left2")
			paddles.push({ slot, x: playX + MARGIN + 1 * GAP, y: abs, w: PADDLE_THICK, h: PADDLE_LEN });
		else if (slot === "right1")
			paddles.push({ slot, x: playX + playW - MARGIN - PADDLE_THICK - 0 * GAP, y: abs, w: PADDLE_THICK, h: PADDLE_LEN });
		else if (slot === "right2")
			paddles.push({ slot, x: playX + playW - MARGIN - PADDLE_THICK - 1 * GAP, y: abs, w: PADDLE_THICK, h: PADDLE_LEN });
		else if (slot === "top")
			paddles.push({ slot, x: abs, y: playY + MARGIN, w: PADDLE_LEN, h: PADDLE_THICK });
		else if (slot === "bottom")
			paddles.push({ slot, x: abs, y: playY + playH - MARGIN - PADDLE_THICK, w: PADDLE_LEN, h: PADDLE_THICK });

	}


	return {
		mode: s.mode,
		playX, playY, playW, playH,
		ballX: s.ball.x,
		ballY: s.ball.y,
		scoreLeft: s.score.left,
		scoreRight: s.score.right,
		phase: s.status === "running" ? "RUNNING" : "LOBBY",
		paddles,
	};
}