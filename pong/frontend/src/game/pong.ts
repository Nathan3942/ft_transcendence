/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/15 16:56:00 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/19 16:33:41 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import type { ModeId, PongConfig, PongEvents, PongInput, PongState } from "./pong_core";
import { DEFAULT_CONFIG, clamp, creatInitialState, updateCore, paddleReact } from "./pong_core";


// ================= Rendering ===================

function drawScore(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: PongState) {
	if (state.mod === "1v1" || state.mod === "2v2") {
		ctx.font = "150px 'vt323'";
		ctx.textAlign = "center";
		ctx.fillText(String(state.scoreP1), canvas.width / 2 - 100, 100);
		ctx.fillText(String(state.scoreP2), canvas.width / 2 + 100, 100);
	} else {

		//p1
		ctx.beginPath();
		for (let i = 0; i < state.paddles[0].life; i++)
			ctx.rect(state.playX + 50 , state.playH - 50 - (20 * i), 10, 10);
		ctx.fill();

		//p2
		ctx.beginPath();
		for (let i = 0; i < state.paddles[1].life; i++)
			ctx.rect(state.playX + state.playW - 40, 30 + (20 * i), 10, 10);
		ctx.fill();

		//p3
		ctx.beginPath();
		for (let i = 0; i < state.paddles[2].life; i++)
			ctx.rect(state.playX + 50 + (20 * i), 30, 10, 10);
		ctx.fill();

		//p4
		ctx.beginPath();
		for (let i = 0; i < state.paddles[3].life; i++)
			ctx.rect(state.playX + state.playW - 50 - (20 * i), state.height - 50, 10, 10);
		ctx.fill();
		
	}

}

function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: PongState, cfg: PongConfig) {
	const { playX, playY, playW, playH } = state;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (state.mod === "3p" || state.mod === "4p") {
		ctx.strokeStyle = "white";
		ctx.lineWidth = 2;
		ctx.strokeRect(
			state.playX,
			state.playY,
			state.playW,
			state.playH
		);
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.fillRect(state.playX, 0, state.playW, canvas.height);
	} else {
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	ctx.fillStyle = "grey";
	ctx.beginPath();
	for (let i = 0; i < canvas.height; i += 20) 
		ctx.rect(canvas.width / 2 - 2.5, i, 10, 10);
	ctx.fill();

	ctx.fillStyle = "white";
	drawScore(ctx, canvas, state);

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
		ctx.font = "90px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText("Press START", canvas.width / 2, canvas.height / 2);
	}
	else if (state.phase === "PAUSED")
	{
		ctx.font = "120px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
	}
	else if (state.phase === "COUNTDOWN")
	{
		ctx.font = "150px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText(String(state.countdown), canvas.width / 2, canvas.height / 2);
	}
	else if (state.phase === "GAMEOVER")
	{
		ctx.font = "120px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText(String("PLAYER " + state.winner + " WINS!"), canvas.width / 2, canvas.height / 2);
		ctx.font = "60px 'VT323'";
		ctx.fillText("Press START to restart", canvas.width / 2, canvas.height / 2 + 80);
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



// ================= Public API ===================

export type PongController = {
	stop: () => void;
	reseize: (w: number, h: number) => void;
	getState: () => PongState;
	setInputSource: (fn: (s: PongState, dt: number) => PongInput) => void; //pour ia ou reseau
};

export function startPong(
	canvas: HTMLCanvasElement, 
	ctx: CanvasRenderingContext2D,
	opts: { mode: ModeId } = { mode: "1v1"},
	config: Partial<PongConfig> = {},
	events?: PongEvents
): PongController {
	const cfg: PongConfig = { ...DEFAULT_CONFIG, ...config};
	const state = creatInitialState(opts.mode, canvas.width, canvas.height, cfg);

	//default input
	const keysDown = creatKeyMap();
	const keysPressed = creatKeyMap();
	const unbind = bindKeyboard(keysDown, keysPressed);

	let inputSource: (s: PongState, dt: number) => PongInput = () => keyboardToInput(keysDown, keysPressed);

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
		render(ctx, canvas, state, cfg);

		rafId = requestAnimationFrame(loop);
	}

	rafId = requestAnimationFrame(loop);

	return {
		stop() {
			running = false;
			cancelAnimationFrame(rafId);
			unbind(); // !!SPA
		},
		reseize(w: number, h: number) {
			canvas.width = w;
			canvas.height = h;
			state.width = w;
			state.height = h;

			// clamp ball
			state.ballX = clamp(state.ballX, cfg.ballRadius, w - cfg.ballRadius);
			state.ballY = clamp(state.ballY, cfg.ballRadius, h - cfg.ballRadius);

			// clamp paddles
			for (const p of state.paddles) {
				if (p.side === "LEFT" || p.side === "RIGHT") {
					p.pos = clamp(p.pos, 0, h - p.len);
				} else {
					p.pos = clamp(p.pos, 0, w - p.len);
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


// const controller = startPong(canvas, ctx, {}, {
//   onGameOver: (winner) => console.log("winner", winner),
// });

// // démontage composant pour SPA
// controller.stop();

// // Si canvas resize:
// controller.resize(newW, newH);

// // Pour input réseau plus tard:
// controller.setInputSource(() => networkInput);