/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/15 16:56:00 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/17 15:40:27 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import type { ModeId, PongConfig, PongEvents, PongInput, PongState } from "./pong_core.js";
import { computePlayfield } from "./pong_core.js"
import { DEFAULT_CONFIG, clamp, creatInitialState, updateCore, paddleReact } from "./pong_core.js";
import { t } from "../i18n/i18n.js";

// ================= Rendering ===================

function drawScore(ctx: CanvasRenderingContext2D, state: PongState) {

	const minDim = Math.min(state.playW, state.playH);
	const scoreFont = Math.max(24, Math.floor(minDim * 0.16));
	const scoreOffset = Math.max(30, Math.floor(state.playW * 0.12));
	const yScore = state.playY + Math.max(30, Math.floor(state.playH * 0.12));

	if (state.mod === "1v1" || state.mod === "2v2") {
		ctx.font = `${scoreFont}px 'VT323'`;
		ctx.textAlign = "center";

		const cx = state.playX + state.playW / 2;

		ctx.fillText(String(state.scoreP1), cx - scoreOffset, yScore);
		ctx.fillText(String(state.scoreP2), cx + scoreOffset, yScore);
	} else {
		const lifeSize = Math.max(6, Math.floor(minDim * 0.012));
		const lifeGap = Math.max(10, Math.floor(minDim * 0.025));
		const pad = Math.max(8, Math.floor(minDim * 0.03));

		// p1
		ctx.beginPath();
		for (let i = 0; i < state.paddles[0].life; i++)
			ctx.rect(state.playX + pad, state.playY + state.playH - pad - lifeSize - (lifeGap * i), lifeSize, lifeSize);
		ctx.fill();

		// p2
		ctx.beginPath();
		for (let i = 0; i < state.paddles[1].life; i++)
			ctx.rect(state.playX + state.playW - pad - lifeSize, state.playY + pad + (lifeGap * i), lifeSize, lifeSize);
		ctx.fill();

		// p3
		ctx.beginPath();
		for (let i = 0; i < state.paddles[2].life; i++)
			ctx.rect(state.playX + pad + (lifeGap * i), state.playY + pad, lifeSize, lifeSize);
		ctx.fill();

		// p4
		ctx.beginPath();
		for (let i = 0; i < state.paddles[3].life; i++)
			ctx.rect(state.playX + state.playW - pad - lifeSize - (lifeGap * i), state.playY + state.playH - pad - lifeSize, lifeSize, lifeSize);
		ctx.fill();
	}
}

function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: PongState, cfg: PongConfig, opts: StartOpts) {
	
	ctx.fillStyle = "black";
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;
	ctx.strokeRect(state.playX, state.playY, state.playW, state.playH);

	ctx.beginPath();
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;
	ctx.strokeRect(state.playX, state.playY, state.playW, state.playH);


	if (state.mod === "3p" || state.mod === "4p") {
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.fillRect(state.playX, 0, state.playW, canvas.height);
	}

	ctx.fillStyle = "grey";
	ctx.beginPath();
	const minDim = Math.min(state.playW, state.playH);
	const dashSize = Math.max(4, Math.floor(minDim * 0.012));
	const dashGap = Math.max(8, Math.floor(minDim * 0.02));
	const bigFont = Math.max(28, Math.floor(minDim * 0.18));
	const mediumFont = Math.max(22, Math.floor(minDim * 0.1));
	const smallFont = Math.max(16, Math.floor(minDim * 0.06));

	const midX = state.playX + state.playW / 2 - dashSize / 2;
	for (let y = state.playY + dashGap; y < state.playY + state.playH - dashGap; y += dashSize + dashGap) {
		ctx.rect(midX, y, dashSize, dashSize);
	}
	ctx.fill();

	ctx.fillStyle = "white";
	drawScore(ctx, state);

	ctx.beginPath();
	for (const p of state.paddles) {
		if (p.activate == true) {
			const r = paddleReact(p, state, cfg);
			ctx.rect(r.x, r.y, r.w, r.h);
		}
	}
	ctx.fill();

	ctx.beginPath();
	ctx.arc(state.ballX, state.ballY, cfg.ballRadius, 0, Math.PI * 2);
	ctx.fill();


	// overlays
	if (state.phase === "LOBBY")
	{
		ctx.font = `${mediumFont}px 'VT323'`;
		ctx.textAlign = "center";
		ctx.fillText(t("ingameMsg.start"), state.playX + state.playW / 2, state.playY + state.playH / 2);
	}
	else if (state.phase === "PAUSED")
	{
		ctx.font = `${bigFont}px 'VT323'`;
		ctx.textAlign = "center";
		ctx.fillText(t("ingameMsg.pause"), canvas.width / 2, canvas.height / 2);
	}
	else if (state.phase === "COUNTDOWN")
	{
		ctx.font = `${bigFont}px 'VT323'`;
		ctx.textAlign = "center";
		ctx.fillText(String(state.countdown), canvas.width / 2, canvas.height / 2);
	}
	else if (state.phase === "GAMEOVER")
	{
		ctx.font = `${mediumFont}px 'VT323'`;
		ctx.textAlign = "center";
		ctx.fillText(String(t("ingameMsg.player") + state.winner + t("ingameMsg.wins")), canvas.width / 2, canvas.height / 2);
		if (opts.tournament === false) {
			ctx.font = `${smallFont}px 'VT323'`;
			ctx.fillText(t("ingameMsg.restart"), canvas.width / 2, canvas.height / 2 + 80);
		}
	}
}


// ================= Input adapters ===================

type KeyMap = Record<string, boolean>;

function creatKeyMap(): KeyMap {
	return (Object.create(null));
}

function bindKeyboard(keysDown: KeyMap, keyPressed: KeyMap) {
	const down = (e: KeyboardEvent) => { 
		if (!keysDown[e.key] && !e.repeat) {
			keyPressed[e.key] = true;
		}
		keysDown[e.key] = true;
	};
		
	const up = (e: KeyboardEvent) => {
		keysDown[e.key] = false;
	}

	window.addEventListener("keydown", down);
	window.addEventListener("keyup", up);

	return () => {
		window.removeEventListener("keydown", down);
		window.removeEventListener("keyup", up);
	};
}

function bindTouch(canvas: HTMLCanvasElement) {

	let touchY: number | null = null;
	let touchX: number | null = null;
	let startPressed = false;

	const onTouchStart = (e: TouchEvent) => {
		e.preventDefault();
		const t = e.touches[0];
		touchY = t.clientY;
		touchX = t.clientX;
		startPressed = true;
	};

	const onTouchMove = (e: TouchEvent) => {
		e.preventDefault();
		const t = e.touches[0];
		touchY = t.clientY;
		touchX = t.clientX;
	};

	const onTouchEnd = (e: TouchEvent) => {
		e.preventDefault();
		if (e.touches.length > 0) {
			touchY = e.touches[0].clientY;
			touchX = e.touches[0].clientX;
		} else {
			touchY = null;
			touchX = null;
		}
	};

	canvas.addEventListener("touchstart", onTouchStart, { passive: false });
	canvas.addEventListener("touchmove", onTouchMove, { passive: false });
	canvas.addEventListener("touchend", onTouchEnd, { passive: false });

	return {
		getTouchY: () => touchY,
		getTouchX: () => touchX,
		consumeStart: () => {
			const v = startPressed;
			startPressed = false;
			return v;
		},
		unbind: () => {
			canvas.removeEventListener("touchstart", onTouchStart);
			canvas.removeEventListener("touchmove", onTouchMove);
			canvas.removeEventListener("touchend", onTouchEnd);
		}
	};
}

//mapage clavier (injectable)
function keyboardToInput(keysDown: KeyMap, keysPressed: KeyMap): PongInput {
	const input: PongInput = {
		p1: {
			up: !!keysDown["w"],
			down: !!keysDown["s"],
			start: !!keysPressed["Enter"],
			togglePause: !!keysPressed["Escape"],
		},
		p2: {
			up: !!keysDown["ArrowUp"],
			down: !!keysDown["ArrowDown"],
			start: !!keysPressed["Enter"],
			togglePause: !!keysPressed["Escape"],
		},
		p3: {
			up: !!keysDown["r"],
			down: !!keysDown["f"],
			start: !!keysPressed["Enter"],
			togglePause: !!keysPressed["Escape"],
		},
		p4: {
			up: !!keysDown["5"],
			down: !!keysDown["2"],
			start: !!keysPressed["Enter"],
			togglePause: !!keysPressed["Escape"],
		}
	};

	keysPressed["Enter"] = false;
	keysPressed["Escape"] = false;

	return (input);
}

function touchToInput(state: PongState, touchY: number | null, touchX: number | null, startPressed: boolean): PongInput {
	const input: PongInput = {
		p1: { up: false, down: false, start: startPressed, togglePause: false },
		p2: { up: false, down: false, start: false, togglePause: false },
		p3: { up: false, down: false, start: false, togglePause: false },
		p4: { up: false, down: false, start: false, togglePause: false },
	};

	if (touchY === null || touchX === null)
		return input;

	const centerY = state.playY + state.playH / 2;

	const centerX = state.playX + state.playW / 2;

	if (touchY < centerY) {
		if (touchX < centerX)
			input.p1.up = true;
		else
			input.p2.up = true;
	}
	else {
		if (touchX < centerX)
			input.p1.down = true;
		else
			input.p2.down = true;
	}
	return input;
}



// ================= Public API ===================

export type StartOpts = {
	mode: ModeId;
	aiLevel?: "easy" | "medium" | "hard" | "off";
	tournament: boolean;
}

export type PongController = {
	stop: () => void;
	resize: (w: number, h: number) => void;
	getState: () => PongState;
	setInputSource: (fn: (s: PongState, dt: number) => PongInput) => void; //pour ia ou reseau
};

export function startPong(
	canvas: HTMLCanvasElement, 
	ctx: CanvasRenderingContext2D,
	opts: StartOpts = { mode: "1v1", aiLevel: "off", tournament: false },
	config: Partial<PongConfig> = {},
	events?: PongEvents
): PongController {

	console.log("START PONG LOOP");

	
	const minCanvas = Math.min(canvas.width, canvas.height);
	const isSmallScreen = canvas.width < 700 || canvas.height < 500;

	const responsiveConfig: PongConfig = {
		...DEFAULT_CONFIG,
		...config,
		ballRadius: isSmallScreen ? Math.max(5, Math.floor(minCanvas * 0.012)) : (config.ballRadius ?? DEFAULT_CONFIG.ballRadius),
		paddleWidth: isSmallScreen ? Math.max(6, Math.floor(minCanvas * 0.012)) : (config.paddleWidth ?? DEFAULT_CONFIG.paddleWidth),
		paddleHeight: isSmallScreen ? Math.max(60, Math.floor(minCanvas * 0.18)) : (config.paddleHeight ?? DEFAULT_CONFIG.paddleHeight),
		paddleMargin: isSmallScreen ? Math.max(4, Math.floor(minCanvas * 0.01)) : (config.paddleMargin ?? DEFAULT_CONFIG.paddleMargin),
		paddleSpeed: isSmallScreen ? Math.max(280 , Math.floor(minCanvas * 0.9)) : (config.paddleSpeed ?? DEFAULT_CONFIG.paddleSpeed),

		ballSpeed: isSmallScreen ? Math.max(200, Math.floor(minCanvas * 0.6)) : (config.ballSpeed ?? DEFAULT_CONFIG.ballSpeed), 
	};

	const cfg: PongConfig = responsiveConfig;
	
	const state = creatInitialState(opts.mode, canvas.width, canvas.height, cfg);

	//default input
	const keysDown = creatKeyMap();
	const keysPressed = creatKeyMap();
	const unbind = bindKeyboard(keysDown, keysPressed);


	const touch = bindTouch(canvas);


	// let inputSource: (s: PongState, dt: number) => PongInput = () => keyboardToInput(keysDown, keysPressed);

	let inputSource: (s: PongState, dt: number) => PongInput = (s, dt) => {
		const touchY = touch.getTouchY();
		const touchX = touch.getTouchX();
		const touchStart = touch.consumeStart();

		if (touchY !== null || touchStart)
			return touchToInput(s, touchY, touchX, touchStart);

		return keyboardToInput(keysDown, keysPressed);
	};

	canvas.addEventListener("touchmove", (e) => {
		e.preventDefault();
	}, { passive: false });

	//boucle controllable
	let rafId = 0;
	let running = true;
	let last = performance.now();

	function loop(now: number) {
		if (!running)
			return;
		const dt = Math.min(0.05, (now - last) / 1000); // clamp dt evite gros saut
		last = now;

		const input = inputSource(state, dt);
		updateCore(state, input, dt, cfg, events);
		render(ctx, canvas, state, cfg, opts);

		rafId = requestAnimationFrame(loop);
	}

	rafId = requestAnimationFrame(loop);

	return {
		stop() {
			running = false;
			cancelAnimationFrame(rafId);
			
			unbind(); // !!SPA
			touch.unbind();
		},
		resize(w: number, h: number) {
			canvas.width = w;
			canvas.height = h;

			state.width = w;
			state.height = h;

			const minCanvas = Math.min(w, h);
			const isSmallScreen = w < 700 || h < 500;

			// config
			cfg.ballRadius = isSmallScreen
				? Math.max(5, Math.floor(minCanvas * 0.012))
				: (config.ballRadius ?? DEFAULT_CONFIG.ballRadius);

			cfg.paddleWidth = isSmallScreen
				? Math.max(6, Math.floor(minCanvas * 0.012))
				: (config.paddleWidth ?? DEFAULT_CONFIG.paddleWidth);

			cfg.paddleHeight = isSmallScreen
				? Math.max(60, Math.floor(minCanvas * 0.18))
				: (config.paddleHeight ?? DEFAULT_CONFIG.paddleHeight);

			cfg.paddleMargin = isSmallScreen
				? Math.max(4, Math.floor(minCanvas * 0.01))
				: (config.paddleMargin ?? DEFAULT_CONFIG.paddleMargin);

			cfg.paddleSpeed = isSmallScreen
				? Math.max(280, Math.floor(minCanvas * 0.9))
				: (config.paddleSpeed ?? DEFAULT_CONFIG.paddleSpeed);

			cfg.ballSpeed = isSmallScreen
				? Math.max(200, Math.floor(minCanvas * 0.6))
				: (config.ballSpeed ?? DEFAULT_CONFIG.ballSpeed);

			// playfield
			const pf = computePlayfield(state.mod, w, h);
			state.playX = pf.x;
			state.playY = pf.y;
			state.playW = pf.w;
			state.playH = pf.h;

			// taille des paddles
			for (const p of state.paddles) {
				p.thick = cfg.paddleWidth;
				p.len = cfg.paddleHeight;
			}

			// vitesse de la balle
			const speed = Math.hypot(state.ballVX, state.ballVY);
			if (speed > 0.0001) {
				const ratio = cfg.ballSpeed / speed;
				state.ballVX *= ratio;
				state.ballVY *= ratio;
			}

			// clamp balle dans le terrain
			state.ballX = clamp(
				state.ballX,
				state.playX + cfg.ballRadius,
				state.playX + state.playW - cfg.ballRadius
			);
			state.ballY = clamp(
				state.ballY,
				state.playY + cfg.ballRadius,
				state.playY + state.playH - cfg.ballRadius
			);

			// clamp paddles dans le terrain
			for (const p of state.paddles) {
				if (p.side === "LEFT" || p.side === "RIGHT") {
					p.pos = clamp(p.pos, 0, state.playH - p.len);
				} else {
					p.pos = clamp(p.pos, 0, state.playW - p.len);
				}
			}
		},
		getState() {
			return (structuredClone(state));
		},
		setInputSource(fn) {
			inputSource = fn;
		},
	};
}

