/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/15 16:56:00 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/27 09:56:07 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { ModeId, PongConfig, PongEvents, PongInput, PongState, computePlayfield } from "./pong_core";
import { DEFAULT_CONFIG, clamp, creatInitialState, updateCore, paddleReact } from "./pong_core";


// ================= Rendering ===================

function drawScore(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: PongState) {
	if (state.mod === "1v1" || state.mod === "2v2") {
		ctx.font = "150px 'vt323'";
		ctx.textAlign = "center";
		
		const cx = state.playX + state.playW / 2;
		const y = state.playY + 120;

		ctx.fillText(String(state.scoreP1), cx - 120, y);
		ctx.fillText(String(state.scoreP2), cx + 120, y);
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

	ctx.fillStyle = "white";
	ctx.font = "120px 'VT323'";
	ctx.textAlign = "center";
	ctx.fillText("COCO_PONG", canvas.width / 2, state.playY - 35);

	if (state.mod === "3p" || state.mod === "4p") {
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.fillRect(state.playX, 0, state.playW, canvas.height);
	}

	ctx.fillStyle = "grey";
	ctx.beginPath();
	const midX = state.playX + state.playW / 2;
	for (let y = state.playY + 10; y < state.playY + state.playH - 10; y += 20) {
		ctx.rect(midX - 2.5, y, 10, 10);
	}
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
		ctx.fillText("Press START", state.playX + state.playW / 2, state.playY + state.playH / 2);
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

export type StartOpts = {
	mode: ModeId;
	aiLevel?: "easy" | "medium" | "hard" | "off";
}

export type PongController = {
	stop: () => void;
	reseize: (w: number, h: number) => void;
	getState: () => PongState;
	setInputSource: (fn: (s: PongState, dt: number) => PongInput) => void; //pour ia ou reseau
};

export function startPong(
	canvas: HTMLCanvasElement, 
	ctx: CanvasRenderingContext2D,
	opts: StartOpts = { mode: "1v1", aiLevel: "hard" },
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

			// recalcul du playfield centré
			const pf = computePlayfield(state.mod, w, h);
			state.playX = pf.x;
			state.playY = pf.y;
			state.playW = pf.w;
			state.playH = pf.h;

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


// const controller = startPong(canvas, ctx, {}, {
//   onGameOver: (winner) => console.log("winner", winner),
// });

// // démontage composant pour SPA
// controller.stop();

// // Si canvas resize:
// controller.resize(newW, newH);

// // Pour input réseau plus tard:
// controller.setInputSource(() => networkInput);