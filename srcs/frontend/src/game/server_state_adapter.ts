/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server_state_adapter.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/23 17:28:04 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/16 07:00:45 by njeanbou         ###   ########.fr       */
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
	life: number;
	activate: boolean;
}

export type ServerGameState = {
	
	id: string;
	status: "waiting" | "running" | "ended";
	phase: "LOBBY" | "COUNTDOWN" | "RUNNING" | "ENDED";
  	
	mode: ModeId;

	score: { left: number; right: number };
	ball: { x: number; y: number; vx: number; vy: number };

	paddles: Partial<Record<GameSlot, ServerPaddle>>;
	
	play?: { x: number; y: number; w: number; h: number };

	countdown: number;

};


export type RenderPaddleRect = {
	slot: GameSlot;
	x: number;
	y: number;
	w: number;
	h: number;
	activate: boolean;
	life: number;
};

export type RenderState = {
	mode: ModeId;
	playX: number; playY: number; playW: number; playH: number;

	ballX: number; ballY: number;
	scoreLeft: number; scoreRight: number;

	phase: "LOBBY" | "COUNTDOWN" | "RUNNING" | "ENDED";
	countdown: number;

	paddles: RenderPaddleRect[];
}

const PADDLE_LEN = 120;

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
	const H = 750;
	const W = 1000;
	const H_CARRE = 800;
	const W_CARRE = 800;
	const X = 100;
	const Y = 100;

	const isSmallScreen = canvasW < 700 || canvasH < 500;
	const fieldScale = isSmallScreen ? 0.92 : 0.78;

	const targetAspect = 4 / 3;
	const maxW = canvasW * fieldScale;
	const maxH = canvasH * fieldScale;

	let w = maxW;
	let h = w / targetAspect;

	if (h > maxH) {
		h = maxH;
		w = h * targetAspect;
	}

	let playX = (canvasW - w) / 2;
	let playY = (canvasH - h) / 2;
	let playW = w;
	let playH = h;

	if (s.mode === "3p" || s.mode === "4p") {
		const squareScale = isSmallScreen ? 0.9 : 0.78;
		const size = Math.min(canvasW, canvasH) * squareScale;
		playX = (canvasW - size) / 2;
		playY = (canvasH - size) / 2;
		playW = size;
		playH = size;
	}

	const minDim = Math.min(playW, playH);
	const paddleThick = Math.max(6, Math.floor(minDim * 0.012));
	const paddleLen = Math.max(50, (PADDLE_LEN / H) * playH);
	const margin = Math.max(4, Math.floor(minDim * 0.01));
	const gap = paddleThick + Math.max(4, Math.floor(minDim * 0.01));

	function toScreenX(x: number, mode: ModeId): number {
		if (mode === "3p" || mode === "4p")
			return playX + ((x - X) / W_CARRE) * playW;
		return playX + ((x - X) / W) * playW;
	}

	function toScreenY(y: number, mode: ModeId): number {
		if (mode === "3p" || mode === "4p")
			return playY + ((y - 10) / H_CARRE) * playH;
		return playY + ((y - Y) / H) * playH;
	}

	function toScreenPaddleX(x: number, mode: ModeId): number {
		if (mode === "3p" || mode === "4p")
			return playX + (x / W_CARRE) * playW;
		return playX + (x / W) * playW;
	}

	function toScreenPaddleY(y: number, mode: ModeId): number {
		if (mode === "3p" || mode === "4p")
			return playY + (y / H_CARRE) * playH;
		return playY + (y / H) * playH;
	}

	const paddles: RenderPaddleRect[] = [];
	const wantedSlot = slotsForMode(s.mode);

	for (const slot of wantedSlot) {
		const p = s.paddles?.[slot];
		if (!p)
			continue;

		const activate = p.activate ?? true;
		const life = p.life ?? 0;

		if (slot === "left")
			paddles.push({
				slot,
				x: playX + margin,
				y: toScreenPaddleY(p.pos, s.mode),
				w: paddleThick,
				h: paddleLen,
				activate,
				life
			});
		else if (slot === "right")
			paddles.push({
				slot,
				x: playX + playW - margin - paddleThick,
				y: toScreenPaddleY(p.pos, s.mode),
				w: paddleThick,
				h: paddleLen,
				activate,
				life
			});
		else if (slot === "left1")
			paddles.push({
				slot,
				x: playX + margin,
				y: toScreenPaddleY(p.pos, s.mode),
				w: paddleThick,
				h: paddleLen,
				activate,
				life
			});
		else if (slot === "left2")
			paddles.push({
				slot,
				x: playX + margin + gap,
				y: toScreenPaddleY(p.pos, s.mode),
				w: paddleThick,
				h: paddleLen,
				activate,
				life
			});
		else if (slot === "right1")
			paddles.push({
				slot,
				x: playX + playW - margin - paddleThick,
				y: toScreenPaddleY(p.pos, s.mode),
				w: paddleThick,
				h: paddleLen,
				activate,
				life
			});
		else if (slot === "right2")
			paddles.push({
				slot,
				x: playX + playW - margin - paddleThick - gap,
				y: toScreenPaddleY(p.pos, s.mode),
				w: paddleThick,
				h: paddleLen,
				activate,
				life
			});
		else if (slot === "top")
			paddles.push({
				slot,
				x: toScreenPaddleX(p.pos, s.mode),
				y: playY + margin,
				w: paddleLen,
				h: paddleThick,
				activate,
				life
			});
		else if (slot === "bottom")
			paddles.push({
				slot,
				x: toScreenPaddleX(p.pos, s.mode),
				y: playY + playH - margin - paddleThick,
				w: paddleLen,
				h: paddleThick,
				activate,
				life
			});
	}

	return {
		mode: s.mode,
		playX,
		playY,
		playW,
		playH,
		ballX: toScreenX(s.ball.x, s.mode),
		ballY: toScreenY(s.ball.y, s.mode),
		scoreLeft: s.score.left,
		scoreRight: s.score.right,
		phase: s.phase,
		paddles,
		countdown: s.countdown,
	};
}