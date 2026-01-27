/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong_core.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/19 10:11:49 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/27 10:16:21 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// ================= Types ===================
export type PongConfig = {
	ballRadius:		number;
	paddleSpeed:	number;
	ballSpeed:		number;
	paddleWidth:	number;
	paddleHeight:	number;
	paddleMargin:	number;
	winningScore:	number;
};

export type PlayerInput = {
	up:				boolean;
	down:			boolean;
	start?:			boolean;
	togglePause?:	boolean;
};


export type PongInput = {
	p1:	PlayerInput;
	p2: PlayerInput;
	p3:	PlayerInput;
	p4: PlayerInput;
};

export type PongEvents = {
	onScore?:		(player: 1 | 2, s1: number, s2: number) => void;
	onGameOver?:	(winner: 1 | 2 | 3 | 4, s1: number, s2:number) => void;
	onStateChange?:	(phase: PongState["phase"]) => void;
};

export type ModeId = "1v1" | "2v2" | "3p" | "4p";

type PaddleSide = "LEFT" | "RIGHT" | "TOP" | "BOTTOM";

type Paddle = {
	side:	PaddleSide;
	pos:	number;
	len:	number;
	thick:	number;
	lane?:	number;
	life:	number;
	activate:	boolean;
};

export type PongState = {
	mod:	ModeId;
	phase:	"LOBBY" | "COUNTDOWN" | "RUNNING" | "PAUSED" | "GAMEOVER";

	width:	number;
	height:	number;

	scoreP1:	number;
	scoreP2:	number;
	winner:		1 | 2 | 3 | 4 | null;

	countdown:		number;
	countdownAcc:	number;

	ballX:	number;
	ballY:	number;
	ballVX:	number;
	ballVY:	number;

	paddles: Paddle[];

	playX:	number;
	playY:	number;
	playW:	number;
	playH:	number;
};



// ================= Default ===================

export const DEFAULT_CONFIG: PongConfig = {
	ballRadius:		10,
	paddleSpeed:	600,
	ballSpeed:		420,
	paddleWidth:	10,
	paddleHeight:	150,
	paddleMargin:	10,
	winningScore:	9,
};


// ================= Helpers ===================

export function computePlayfield(mod: ModeId, canvasW: number, canvasH: number) {
	if (mod == "3p" || mod === "4p") {
		const size = Math.min(canvasW, canvasH);
		return {
			x: (canvasW - size) / 2,
			y: (canvasH - size) / 2,
			w: size,
			h: size,
		};
	}

	const targetAspect = 4 / 3;
	const maxW = canvasW * 0.78;
	const maxH = canvasH * 0.78;

	let w = maxW;
	let h = w / targetAspect;

	if (h > maxH) {
		h = maxH;
		w = h * targetAspect;
	}

	return { x: (canvasW - w) / 2, y: (canvasH - h) / 2, w, h };
}

export function clamp(v: number, min: number, max: number) {
	return Math.max(min, Math.min(max, v));
}

function randomSign() {
	return Math.random() < 0.5 ? -1 : 1;
}

export function resetBall(state: PongState, cfg: PongConfig) {
	state.ballX = state.playX + state.playW / 2;
	state.ballY = state.playY + state.playH / 2;

	state.ballVX = cfg.ballSpeed * randomSign();
	state.ballVY = cfg.ballSpeed * 0.6 * randomSign();
}

function moveAxis(input: PlayerInput) {
	return (input.down ? 1 : 0) - (input.up ? 1 : 0)
}

export function paddleReact(p: Paddle, state: PongState, cfg: PongConfig) {
	const m = cfg.paddleMargin;
	const lane = p.lane ?? 0;

	const gap = cfg.paddleWidth + 8;
	const laneOffset = lane * gap;

	const x0 = state.playX;
	const y0 = state.playY;
	const w = state.playW;
	const h = state.playH;

	if (p.side === "LEFT") {
		return { x: x0 + m + laneOffset, y: y0 + p.pos, w: p.thick, h: p.len };
	}
	if (p.side === "RIGHT") {
		return { x: x0 + w - m - p.thick - laneOffset, y: y0 + p.pos, w: p.thick, h: p.len };
	}
	if (p.side === "TOP") {
		return { x: x0 + p.pos, y: y0 + m, w: p.len, h: p.thick };
	}

	return {
		x: x0 + p.pos,
		y: y0 + h - m - p.thick,
		w: p.len,
		h: p.thick
	};
}

function ballIntersectsRect(ballX: number, ballY: number, r: number, rect: { x: number, y: number, w: number, h: number}) {
	const closestX = clamp(ballX, rect.x, rect.x + rect.w);
	const closestY = clamp(ballY, rect.y, rect.y + rect.h);
	const dx = ballX - closestX;
	const dy = ballY - closestY;
	return (dx * dx + dy * dy <= r * r);
}

function setBallSpeed(state: PongState, targetSpeed: number) {
  const v = Math.hypot(state.ballVX, state.ballVY);
  if (v <= 1e-6) {
    state.ballVX = targetSpeed;
    state.ballVY = 0;
    return;
  }
  const k = targetSpeed / v;
  state.ballVX *= k;
  state.ballVY *= k;
}

function applyBounceFromPaddle(state: PongState, p: Paddle, cfg: PongConfig) {
	const max = cfg.ballSpeed * 1.0;
	const half = p.len / 2;
	if (half <= 1e-6)
		return;

	// balle playfield
	const localBallX = state.ballX - state.playX;
	const localBallY = state.ballY - state.playY;

	const center = p.pos + half;

	if (p.side === "LEFT" || p.side === "RIGHT") {
		const hit = clamp(localBallY, p.pos, p.pos + p.len);
		let norm = (hit - center) / half;
		norm = clamp(norm, -0.9, 0.9);

		state.ballVX = Math.abs(state.ballVX) * (p.side === "LEFT" ? 1 : -1);
		state.ballVY = norm * max;
	} else {
		const hit = clamp(localBallX, p.pos, p.pos + p.len);
		let norm = (hit - center) / half;
		norm = clamp(norm, -0.9, 0.9);

		state.ballVY = Math.abs(state.ballVY) * (p.side === "TOP" ? 1 : -1);
		state.ballVX = norm * max;
	}

	setBallSpeed(state, cfg.ballSpeed);
}

function maxPlayerForMode(mod: ModeId): number {
	if (mod === "1v1") return (2);
	if (mod === "2v2") return (4);
	if (mod === "3p") return (3);
	return (4);
}


// ================= Modes ===================

type GameMode = {
	id: ModeId;
	initPaddles: (w: number, h: number, cfg: PongConfig) => Paddle[];

	checkScore: (state: PongState, cfg: PongConfig) => 1 | 2 | null;
	updatePaddles: (state: PongState, input: PongInput, dt: number, cfg: PongConfig) => void;
	handleWallBounce: (state: PongState, cfg: PongConfig) => void;
}

const mode1v1: GameMode = {
	id: "1v1", 
	initPaddles: (w, h, cfg) => ([
		{ side: "LEFT", pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 0, activate: true },
		{ side: "RIGHT", pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 0, activate: true },
	]),
	checkScore: (state, cfg) => {
		const left  = state.playX + cfg.ballRadius;
		const right = state.playX + state.playW - cfg.ballRadius;
		if (state.ballX >= right) return 1;
		if (state.ballX <= left) return 2;
		return null;
	},
	updatePaddles: (state, input, dt, cfg) => {
		const speed = cfg.paddleSpeed * dt;
		const p1 = state.paddles[0];
		const p2 = state.paddles[1];
		p1.pos += moveAxis(input.p1) * speed;
		p2.pos += moveAxis(input.p2) * speed;
		
		p1.pos = clamp(p1.pos, 0, state.playH - p1.len);
		p2.pos = clamp(p2.pos, 0, state.playH - p2.len);
	},
	handleWallBounce: (state, cfg) => {
		const top = state.playY + cfg.ballRadius;
		const bottom = state.playY + state.playH - cfg.ballRadius;

		if (state.ballY <= top) {
			state.ballY = top;
			state.ballVY *= -1;
		}
		if (state.ballY >= bottom) {
			state.ballY = bottom;
			state.ballVY *= -1;
		}
	},
};

const mode2v2: GameMode = {
	id: "2v2",
	initPaddles: (w, h, cfg) => ([
		{ side: "LEFT",  pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, lane: 0, life: 0, activate: true },
		{ side: "RIGHT", pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, lane: 0, life: 0, activate: true },
		{ side: "LEFT",  pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, lane: 1, life: 0, activate: true }, 
		{ side: "RIGHT", pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, lane: 1, life: 0, activate: true }, 
	]),
	checkScore: (state, cfg) => {
		const left  = state.playX + cfg.ballRadius;
		const right = state.playX + state.playW - cfg.ballRadius;
		if (state.ballX >= right) return 1;
		if (state.ballX <= left) return 2;
		return null;
	},
	updatePaddles: (state, input, dt, cfg) => {
		const speed = cfg.paddleSpeed * dt;
		const p1 = state.paddles[0];
		const p2 = state.paddles[1];
		const p3 = state.paddles[2];
		const p4 = state.paddles[3];

		p1.pos += moveAxis(input.p1) * speed;
		p2.pos += moveAxis(input.p2) * speed;
		p3.pos += moveAxis(input.p3) * speed;
		p4.pos += moveAxis(input.p4) * speed;

		for (const p of [p1, p2, p3, p4]) {
			p.pos = clamp(p.pos, 0, state.playH - p.len);
		}
	},
	handleWallBounce: (state, cfg) => {
		const top = state.playY + cfg.ballRadius;
		const bottom = state.playY + state.playH - cfg.ballRadius;

		if (state.ballY <= top) {
			state.ballY = top;
			state.ballVY *= -1;
		}
		if (state.ballY >= bottom) {
			state.ballY = bottom;
			state.ballVY *= -1;
		}
	},
};

const mode4p: GameMode = {
	id: "4p",
	initPaddles: (w, h, cfg) => ([
		{ side: "LEFT",   pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 3, activate: true },
		{ side: "RIGHT",  pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 3, activate: true }, 
		{ side: "TOP",    pos: w / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 3, activate: true }, 
		{ side: "BOTTOM", pos: w / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 3, activate: true }, 
	]),
	// TODO: règle de score 4P à définir (qui perd quand la balle sort ? élimination ?)
	checkScore: (state, cfg) => {
		if (state.ballX <= state.playX + cfg.ballRadius && state.paddles[0].life > 0) {
			state.paddles[0].life--;
			return (1);
		}
		if (state.ballX >= state.playX + state.playW - cfg.ballRadius && state.paddles[1].life > 0) {
			state.paddles[1].life--;
			return (1);
		}
		if (state.ballY <= state.playY + cfg.ballRadius && state.paddles[2].life > 0) {
			state.paddles[2].life--;
			return (1);
		}
		if (state.ballY >= state.playY + state.playH - cfg.ballRadius && state.paddles[3].life > 0) {
			state.paddles[3].life--;
			return (1);
		}
		return (null);
	},
	updatePaddles: (state, input, dt, cfg) => {
		const speed = cfg.paddleSpeed * dt;

		const p1 = state.paddles[0]; 
		const p2 = state.paddles[1]; 
		const p3 = state.paddles[2];
		const p4 = state.paddles[3]; 

		p1.pos += moveAxis(input.p1) * speed;
		p2.pos += moveAxis(input.p2) * speed;
		p3.pos += moveAxis(input.p3) * speed;
		p4.pos += moveAxis(input.p4) * speed;

		p1.pos = clamp(p1.pos, 0, state.playH - p1.len);
		p2.pos = clamp(p2.pos, 0, state.playH - p2.len);
		p3.pos = clamp(p3.pos, 0, state.playW - p3.len);
		p4.pos = clamp(p4.pos, 0, state.playW - p4.len);
	},
	handleWallBounce: (state, cfg) => {
		const left   = state.playX + cfg.ballRadius;
		const right  = state.playX + state.playW - cfg.ballRadius;
		const top    = state.playY + cfg.ballRadius;
		const bottom = state.playY + state.playH - cfg.ballRadius;

		if (state.ballY <= top)    { state.ballY = top;    state.ballVY *= -1; }
		if (state.ballY >= bottom) { state.ballY = bottom; state.ballVY *= -1; }
		if (state.ballX <= left)   { state.ballX = left;   state.ballVX *= -1; }
		if (state.ballX >= right)  { state.ballX = right;  state.ballVX *= -1; }
	},
};

const mode3p: GameMode = {
	id: "3p",
	initPaddles: (w, h, cfg) => ([
		{ side: "LEFT",   pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 3, activate: true },
		{ side: "RIGHT",  pos: h / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 3, activate: true }, 
		{ side: "TOP",    pos: w / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 3, activate: true },
		{ side: "BOTTOM", pos: w / 2 - cfg.paddleHeight / 2, len: cfg.paddleHeight, thick: cfg.paddleWidth, life: 0, activate: false }, 
	]),
	checkScore: mode4p.checkScore,
	updatePaddles: mode4p.updatePaddles,
	handleWallBounce: mode4p.handleWallBounce,
};

const MODES: Record<ModeId, GameMode> = {
	"1v1":	mode1v1,
	"2v2":	mode2v2,
	"3p":	mode3p,
	"4p":	mode4p,
};

// ================= State init ===================
export function creatInitialState(mode: ModeId, width: number, height: number, cfg: PongConfig): PongState {
	const pf = computePlayfield(mode, width, height);

	const state: PongState = {
		mod: mode,
		phase: "LOBBY",
		width,
		height,

		scoreP1: 0,
		scoreP2: 0,
		winner: null,

		countdown: 3,
		countdownAcc: 0,

		ballX: pf.x + pf.w / 2,
		ballY: pf.y + pf.h / 2,
		ballVX: cfg.ballSpeed * randomSign(),
		ballVY: cfg.ballSpeed * 0.6 * randomSign(),

		paddles: MODES[mode].initPaddles(pf.w, pf.h, cfg),
		playX: pf.x,
		playY: pf.y,
		playW: pf.w,
		playH: pf.h
	};
	return state;
}


// ================= Upload / Rules ===================

function applyScore(state: PongState, cfg: PongConfig, event?: PongEvents, player?: 1 | 2) {
	if (!player) return;

	if (player === 1)
		state.scoreP1++;
	else
		state.scoreP2++;

	event?.onScore?.(player, state.scoreP1, state.scoreP2);

	if (state.scoreP1 >= cfg.winningScore) {
		state.phase = "GAMEOVER";
		state.winner = 1;
		event?.onGameOver?.(1, state.scoreP1, state.scoreP2);
		event?.onStateChange?.(state.phase);
		return;
	}
	if (state.scoreP2 >= cfg.winningScore) {
		state.phase = "GAMEOVER";
		state.winner = 2;
		event?.onGameOver?.(2, state.scoreP1, state.scoreP2);
		event?.onStateChange?.(state.phase);
		return;
	}

	resetBall(state, cfg);
	state.phase = "COUNTDOWN";
	state.countdown = 3;
	state.countdownAcc = 0;
	event?.onStateChange?.(state.phase);
}

function applyScore4P(state: PongState, cfg: PongConfig, event?: PongEvents) {

	let standing = 4;
	for (const p of state.paddles) {
		if (p.life <= 0) {
			p.activate = false;
			standing--;
		}
	}
	if (standing === 1)
	{
		const aliveIndex = state.paddles.findIndex(p => p.life > 0 && p.activate);
		state.winner = (aliveIndex >= 0 ? (aliveIndex + 1) as 1 | 2 | 3 | 4 : null);
		state.phase = "GAMEOVER";
		event?.onGameOver?.(2, state.scoreP1, state.scoreP2);
		event?.onStateChange?.(state.phase);
		return;
	}

	resetBall(state, cfg);
	state.phase = "COUNTDOWN";
	state.countdown = 3;
	state.countdownAcc = 0;
	event?.onStateChange?.(state.phase);
}

export function updateCore(state: PongState, input: PongInput, dt: number, cfg: PongConfig, event?: PongEvents) {
	const startPressed = !!(input.p1.start || input.p2.start || input.p3.start || input.p4.start);
	const togglePause = !!(input.p1.togglePause || input.p2.togglePause || input.p3.togglePause || input.p4.togglePause);

	if (state.phase === "LOBBY") {
		if (startPressed) {
			state.phase = "COUNTDOWN";
			state.countdown = 3;
			state.countdownAcc = 0;
			resetBall(state, cfg);
			event?.onStateChange?.(state.phase);
		}
		return;//
	}

	if (state.phase === "GAMEOVER") {
		if (startPressed) {
			state.scoreP1 = 0;
			state.scoreP2 = 0;
			
			const maxPlayer = maxPlayerForMode(state.mod);
			state.paddles.forEach((p, i) => {
				if (i < maxPlayer) {
					p.life = 3;
					p.activate = true;
				}
			})
			state.winner = null;
			state.phase = "COUNTDOWN";
			state.countdown = 3;
			state.countdownAcc = 0;
			resetBall(state, cfg);
			event?.onStateChange?.(state.phase);
		}
		return;
	}

	if (togglePause) {
		if (state.phase === "RUNNING") {
			state.phase = "PAUSED";
			event?.onStateChange?.(state.phase);
			return;
		}
		else if (state.phase === "PAUSED")
		{
			state.phase = "COUNTDOWN";
			state.countdown = 3;
			state.countdownAcc = 0;
			event?.onStateChange?.(state.phase);
			return;
		}
	}

	if (state.phase === "PAUSED") return;

	if (state.phase === "COUNTDOWN") {
		state.countdownAcc += dt;
		if (state.countdownAcc >= 1) {
			state.countdownAcc -= 1;
			state.countdown--;
			if (state.countdown <= 0) {
				state.phase = "RUNNING";
				event?.onStateChange?.(state.phase);
			}
		}
		if (togglePause) {
				state.phase = "PAUSED";
				event?.onStateChange?.(state.phase);
			}
		return;
	}


	// RUNNING
	const mode = MODES[state.mod];

	mode.updatePaddles(state, input, dt, cfg);

	state.ballX += state.ballVX * dt;
	state.ballY += state.ballVY * dt;

	mode.handleWallBounce(state, cfg);

	for (const p of state.paddles) {
		if (p.activate === false)
			continue;
		const r = paddleReact(p, state, cfg);
		if (ballIntersectsRect(state.ballX, state.ballY, cfg.ballRadius, r)) {
			applyBounceFromPaddle(state, p, cfg);
			//att au 4p pour les colision paddle
			break;
		}
	}

	const scored = mode.checkScore(state, cfg);
	if (scored && state.mod != "4p" && state.mod != "3p") {
		applyScore(state, cfg, event, scored);
	}
	else if (scored)
		applyScore4P(state, cfg, event);
}


