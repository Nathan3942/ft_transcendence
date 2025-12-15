/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/15 16:56:00 by njeanbou          #+#    #+#             */
/*   Updated: 2025/12/15 19:00:42 by njeanbou         ###   ########.fr       */
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
	maxBounceAngle:	number;
	winningScore:	number;
};

export type PlayerInput = {
	up:				boolean;
	down:			boolean;
	start?:			boolean;
	togglePause?:	boolean;
}


export type PongInput = {
	p1:	PlayerInput;
	p2: PlayerInput;
}

export type PongEvents = {
	onScore?:		(player: 1 | 2, s1: number, s2: number) => void;
	onGameOver?:	(winner: 1 | 2, s1: number, s2:number) => void;
	onStateChange?:	(phase: PongState["phase"]) => void;
}

export type PongState = {
	phase:	"LOBBY" | "COUNTDOWN" | "RUNNING" | "PAUSED" | "GAMEOVER";

	width:	number;
	height:	number;

	scoreP1:	number;
	scoreP2:	number;
	winner:		1 | 2 | null;

	countdown:		number;
	countdownAcc:	number;

	ballX:	number;
	ballY:	number;
	ballVX:	number;
	ballVY:	number;

	p1Y:	number;
	p2Y:	number;
};


// ================= Default ===================

export const DEFAULT_CONFIG: PongConfig = {
	ballRadius:		10,
	paddleSpeed:	6,
	ballSpeed:		4.2,
	paddleWidth:	10,
	paddleHeight:	150,
	paddleMargin:	10,
	maxBounceAngle:	8,
	winningScore:	9,
};


// ================= Helpers ===================

function clamp(v: number, min: number, max: number) {
	return Math.max(min, Math.min(max, v));
}

function randomSign() {
	return Math.random() < 0.5 ? -1 : 1;
}

function resetBall(state: PongState, cfg: PongConfig) {
	state.ballX = state.width / 2;
	state.ballY = state.height / 2;

	state.ballVX = cfg.ballSpeed * randomSign();
	state.ballVY = cfg.ballSpeed * 0.6 * randomSign();
}

function creatInitialState(width: number, height: number, cfg: PongConfig): PongState {
	const state: PongState = {
		phase: "LOBBY",
		width,
		height,

		scoreP1:	0,
		scoreP2:	0,
		winner:		null,

		countdown:		3,
		countdownAcc:	0,

		ballX:	width / 2,
		ballY:	height / 2,
		ballVX:	cfg.ballSpeed * randomSign(),
		ballVY:	cfg.ballSpeed * 0.6 * randomSign(),

		p1Y:	height / 2 - cfg.paddleHeight / 2,
		p2Y:	height / 2 - cfg.paddleHeight / 2,
	};
	return state;
}


// ================= Rendering ===================

function drawScore(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, s1: number, s2: number) {
	ctx.font = "150px 'vt323'";
	ctx.textAlign = "center";
	ctx.fillText(String(s1), canvas.width / 2 - 100, 100);
	ctx.fillText(String(s2), canvas.width / 2 + 100, 100);
}

function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: PongState, cfg: PongConfig) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "grey";
	ctx.beginPath();
	for (let i = 0; i < canvas.height; i += 20) 
		ctx.rect(canvas.width / 2 - 2.5, i, 10, 10);
	ctx.fill();

	ctx.fillStyle = "white";
	drawScore(ctx, canvas, state.scoreP1, state.scoreP2);

	const p1X = cfg.paddleMargin;
	const p2X = canvas.width - (cfg.paddleWidth + cfg.paddleMargin);

	ctx.beginPath();
	ctx.rect(p1X, state.p1Y, cfg.paddleWidth, cfg.paddleHeight);
	ctx.rect(p2X, state.p2Y, cfg.paddleWidth, cfg.paddleHeight);
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
		const text = state.winner === 1 ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);
		ctx.font = "60px 'VT323'";
		ctx.fillText("Press START to restart", canvas.width / 2, canvas.height / 2 + 80);
	}
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
		state.phase == "GAMEOVER";
		state.winner = 1;
		event?.onGameOver?.(1, state.scoreP1, state.scoreP2);
		event?.onStateChange?.(state.phase);
		return;
	}
	if (state.scoreP1 >= cfg.winningScore) {
		state.phase == "GAMEOVER";
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

function update(state: PongState, input: PongInput, dt: number, cfg: PongConfig, event?: PongEvents) {
	const startPressed = !!(input.p1.start || input.p2.start);
	const togglePause = !!(input.p1.togglePause || input.p2.togglePause);

	if (state.phase === "LOBBY") {
		if (startPressed)
		{
			state.phase = "COUNTDOWN";
			state.countdown = 3;
			state.countdownAcc = 0;
			resetBall(state, cfg);
			event?.onStateChange?.(state.phase);
		}
		return;
	}

	if (state.phase === "GAMEOVER") {
		if (startPressed) {
			state.scoreP1 = 0;
			state.scoreP2 = 0;
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
		return;
	}


	// RUNNING
	//paddles
	const moveP1 = (input.p1.down ? 1 : 0) - (input.p1.up ? 1 : 0);
	const moveP2 = (input.p2.down ? 1 : 0) - (input.p2.up ? 1 : 0);

	state.p1Y += moveP1 * cfg.paddleSpeed * dt;
	state.p2Y += moveP2 * cfg.paddleSpeed * dt;

	state.p1Y = clamp(state.p1Y, 0, state.height - cfg.paddleHeight);
	state.p2Y = clamp(state.p2Y, 0, state.height - cfg.paddleHeight);

	//ball
	state.ballX += state.ballVX * dt;
	state.ballY += state.ballVY * dt;

	// top/bottom bounce
	if (state.ballY <= cfg.ballRadius) {
		state.ballY = cfg.ballRadius;
		state.ballVY *= -1;
	}
	if (state.ballY >= state.width - cfg.ballRadius) {
		state.ballY = state.height - cfg.ballRadius;
		state.ballVY *= -1;
	}

	//scoring
	if (state.ballX >= state.width - cfg.ballRadius) {
		applyScore(state, cfg, event, 1);
		return;
	}
	if (state.ballX <= cfg.ballRadius) {
		applyScore(state, cfg, event, 2);
		return;
	}

	//collisions paddles
	const p1X = cfg.paddleMargin;
	const p2X = state.width - (cfg.paddleWidth + cfg.paddleMargin);

	const hitP1 = 
		state.ballX - cfg.ballRadius < p1X + cfg.paddleWidth &&
		state.ballY > state.p1Y &&
		state.ballY < state.p1Y + cfg.paddleHeight &&
		state.ballVX < 0;

	if (hitP1) {
		const rel = (state.p1Y + cfg.paddleHeight / 2) - state.ballY;
		const norm = rel / (cfg.paddleHeight / 2);
		state.ballVY = -norm * cfg.maxBounceAngle * 60;
		state.ballVX *= -1;
		state.ballX = p1X + cfg.paddleWidth + cfg.ballRadius;
	}

	const hitP2 = 
		state.ballX + cfg.ballRadius > p2X &&
		state.ballY > state.p2Y &&
		state.ballY < state.p2Y + cfg.paddleHeight &&
		state.ballVX > 0;

	if (hitP2) {
		const rel = (state.p2Y + cfg.paddleHeight / 2) - state.ballY;
		const norm = rel / (cfg.paddleHeight / 2);
		state.ballVY = -norm * cfg.maxBounceAngle * 60;
		state.ballVX *= -1;
		state.ballX = p2X - cfg.ballRadius;
	}
}



// ================= Input adapters ===================

type KeyMap = Record<string, boolean>;

function creatKeyMap(): KeyMap {
	return (Object.create(null));
}

function bindKeyboard(keys: KeyMap) {
	const down = (e: KeyboardEvent) => (keys[e.key] = true);
	const up = (e: KeyboardEvent) => (keys[e.key] = false);

	window.addEventListener("keydown", down);
	window.addEventListener("keyup", up);

	return () => {
		window.removeEventListener("keydown", down);
		window.removeEventListener("keyup", up);
	};
}

//mapage clavier (injectable)
function keyboardToInput(keys: KeyMap): PongInput {
	return {
		p1: {
			up: !!keys["w"],
			down: !!keys["s"],
			start: !!keys["Enter"],
			togglePause: !!keys["Escape"],
		},
		p2: {
			up: !!keys["ArrowUp"],
			down: !!keys["ArrowDown"],
			start: !!keys["Enter"],
			togglePause: !!keys["Escape"],
		},
	};
}



// ================= Public API ===================

export type PongController = {
	stop: () => void;
	reseize: (w: number, h: number) => void;
	getState: () => PongState;
	setInputSource: (fn: () => PongInput) => void; //pour ia ou reseau
};

export function startPong(
	canvas: HTMLCanvasElement, 
	ctx: CanvasRenderingContext2D,
	config: Partial<PongConfig> = {},
	events?: PongEvents
): PongController {
	const cfg: PongConfig = { ...DEFAULT_CONFIG, ...config};

	const state = creatInitialState(canvas.width, canvas.height, cfg);

	//default input
	const keys = creatKeyMap();
	const unbind = bindKeyboard(keys);

	let inputSource: () => PongInput = () => keyboardToInput(keys);

	//boucle controllable
	let rafId = 0;
	let running = true;
	let last = performance.now();

	function loop(now: number) {
		if (!running)
			return;
		const dt = Math.min(0.5, (now - last) / 1000); // clamp dt evite gros saut
		last = dt;

		const input = inputSource();
		update(state, input, dt, cfg, events);
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
			state.p1Y = clamp(state.p1Y, 0, h - cfg.paddleHeight);
			state.p2Y = clamp(state.p2Y, 0, h = cfg.paddleHeight);
			state.ballX = clamp(state.ballX, cfg.ballRadius, w - cfg.ballRadius);
			state.ballY = clamp(state.ballY, cfg.ballRadius, h - cfg.ballRadius);
		},
		getState() {
			return (structuredClone(state));
		},
		setInputSource(fn) {
			inputSource = fn;
		},
	};
}










// ===================================================================================================================================================

// const keys: Record<string, boolean> = {};


// function draw_number_p1(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, score: Number)
// {
// 	ctx.font = "150px 'VT323'";
// 		ctx.textAlign = "center";
// 		ctx.fillText(score.toString(), canvas.width / 2 - 100, 100);
// }

// function draw_number_p2(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, score: Number)
// {
// 	ctx.font = "150px 'VT323'";
// 		ctx.textAlign = "center";
// 		ctx.fillText(score.toString(), canvas.width / 2 + 100, 100);
// }

// function draw_score(
//     ctx: CanvasRenderingContext2D,
//     canvas: HTMLCanvasElement,
//     score1: number,
//     score2: number
// ) {
//     switch (score1)
// 	{
// 		case 0:
// 			draw_number_p1(ctx, canvas, 0);
// 			break;
// 		case 1:
// 			draw_number_p1(ctx, canvas, 1);
// 			break;
// 		case 2:
// 			draw_number_p1(ctx, canvas, 2);
// 			break;
// 		case 3:
// 			draw_number_p1(ctx, canvas, 3);
// 			break;
// 		case 4:
// 			draw_number_p1(ctx, canvas, 4);
// 			break;
// 		case 5:
// 			draw_number_p1(ctx, canvas, 5);
// 			break;
// 		case 6:
// 			draw_number_p1(ctx, canvas, 6);
// 			break;
// 		case 7:
// 			draw_number_p1(ctx, canvas, 7);
// 			break;
// 		case 8:
// 			draw_number_p1(ctx, canvas, 8);
// 			break;
// 		case 9:
// 			draw_number_p1(ctx, canvas, 9);
// 			break;
// 	}
// 	switch (score2)
// 	{
// 		case 0:
// 			draw_number_p2(ctx, canvas, 0);
// 			break;
// 		case 1:
// 			draw_number_p2(ctx, canvas, 1);
// 			break;
// 		case 2:
// 			draw_number_p2(ctx, canvas, 2);
// 			break;
// 		case 3:
// 			draw_number_p2(ctx, canvas, 3);
// 			break;
// 		case 4:
// 			draw_number_p2(ctx, canvas, 4);
// 			break;
// 		case 5:
// 			draw_number_p2(ctx, canvas, 5);
// 			break;
// 		case 6:
// 			draw_number_p2(ctx, canvas, 6);
// 			break;
// 		case 7:
// 			draw_number_p2(ctx, canvas, 7);
// 			break;
// 		case 8:
// 			draw_number_p2(ctx, canvas, 8);
// 			break;
// 		case 9:
// 			draw_number_p2(ctx, canvas, 9);
// 			break;
// 	}
// }

// export function startPong(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) 
// {
//     const ballRadius = 10;
//     const padSpeed = 8;
//     const maxBounceAngle = 8;

// 	let gameOver = false;
// 	let gameStarted = false;
// 	let paused = false;
// 	let resuming = false;
// 	let countdown = 0;
// 	let nextCountdownTime = 0;
// 	let winner: 1 | 2 | null = null;

// 	let scoreP1 = 0;
// 	let scoreP2 = 0;

//     let ballX = canvas.width / 2;
//     let ballY = canvas.height / 2;

//     let speedX = 6;
//     let speedY = 6;

    
//     let pad1W = 10;
//     let pad1H = 150;
    
//     let pad1X = 10;
//     let pad1Y = canvas.height / 2 - pad1H / 2;

//     let pad2W = 10;
//     let pad2H = 150;
    
//     let pad2X = canvas.width - (pad2W + 10);
//     let pad2Y = canvas.height / 2 - pad1H / 2;

// 	if (Math.random() < 0.5)
// 		speedX *= -1;
// 	if (Math.random() < 0.5)
// 		speedY *= -1;

// 	document.addEventListener("keydown", (e) => {
// 		keys[e.key] = true;
	
// 		if (e.key === "Escape") 
// 		{
// 			if (!paused && !resuming && gameStarted && !gameOver)
// 				paused = !paused;
// 			else if (paused && !resuming && gameStarted && !gameOver)
// 			{
// 				paused = false;
// 				resuming = true;
// 				countdown = 3;
// 				nextCountdownTime = performance.now() + 1000;
// 			}
// 		}

// 		if (e.key === "Enter")
// 		{
// 			gameStarted = true;
// 			resuming = true;
// 			countdown = 3;
// 			nextCountdownTime = performance.now() + 1000;
// 			ballX = canvas.width / 2;
//     		ballY = canvas.height / 2;
// 		}

// 	})
	
// 	document.addEventListener("keyup", (e) =>{
// 		keys[e.key] = false;
// 	})

// 	function score(player: 1 | 2)
// 	{
//         if (player === 1)
//             scoreP1++;
//         else
//             scoreP2++;

// 		if (scoreP1 >= 9)
// 		{
// 			gameOver = true;
// 			winner = 1;
// 			return ;
// 		}
// 		if (scoreP2 >= 9)
// 		{
// 			gameOver = true;
// 			winner = 2;
// 			return ;
// 		}

//         // reset balle
//         ballX = canvas.width / 2;
//         ballY = canvas.height / 2;

//         // direction aléatoire
//         speedX = 6;
//         speedY = 6;
//         if (Math.random() < 0.5)
//             speedX *= -1;
//         if (Math.random() < 0.5)
//             speedY *= -1;
//     }

// 	function drawLoader()
// 	{
// 		ctx.clearRect(0, 0, canvas.width, canvas.height);

// 		ballX += speedX;
//         ballY += speedY;

		

// 		if (ballX >= canvas.width - ballRadius || ballX <= 0 + ballRadius)
//             speedX *= -1;
// 		if (ballY <= 0 + ballRadius || ballY >= canvas.height - ballRadius)
//             speedY *= -1;

// 		ctx.clearRect(0, 0, canvas.width, canvas.height);
// 		ctx.fillStyle = "grey";
//         ctx.beginPath();

//         for (let i = 0; i < canvas.height; i += 20)
//         {
//             ctx.rect(canvas.width / 2 - 5 / 2, i, 10, 10)
//         }
// 		ctx.fill();

// 		ctx.fillStyle = "white"
// 		ctx.beginPath();

//         ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
//         ctx.fill();
// 		ctx.font = "100px 'VT323'";
// 		ctx.textAlign = "center";
// 		ctx.fillText("Press Enter For Start Game", canvas.width / 2, canvas.height / 2);
// 		draw_score(ctx, canvas, scoreP1, scoreP2);
// 		// if (keys["Enter"])
// 		// {
// 		// 	gameStarted = true;
// 		// 	resuming = true;
// 		// 	ballX = canvas.width / 2;
//     	// 	ballY = canvas.height / 2;
// 		// 	return ;
// 		// }
// 	}

// 	function botPalyer()
// 	{
// 		if (pad1Y + (pad1H / 2) > pad2Y + (pad2H / 2))
// 		{
// 			if (ballY <= pad2Y + (pad2H / 4))
// 				pad2Y -= padSpeed;
// 			else if (ballY > pad2Y + (pad2H / 4))
// 				pad2Y += padSpeed;
// 		}
// 		else
// 		{
// 			if (ballY <= pad2Y + (pad2H / 4) * 3)
// 				pad2Y -= padSpeed;
// 			else if (ballY > pad2Y + (pad2H / 4) * 3)
// 				pad2Y += padSpeed;
// 		}
					
// 	}

//     function drawGame()
//     {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

// 		if (gameOver)
// 		{
// 			ctx.clearRect(0, 0, canvas.width, canvas.height);
// 			draw_score(ctx, canvas, scoreP1, scoreP2);
// 			ctx.fillStyle = "white";
// 			ctx.font = "150px 'VT323'";
// 			ctx.textAlign = "center";

// 			const text = winner === 1 ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";
// 			ctx.fillText(text, canvas.width / 2, canvas.height / 2);
// 			if (keys["Enter"])
// 			{
// 				gameOver = false;
// 				scoreP1 = 0;
// 				scoreP2 = 0;
// 			}
// 			return;
// 		}

// 		if (paused)
// 		{
// 			ctx.clearRect(0, 0, canvas.width, canvas.height);

// 			draw_score(ctx, canvas, scoreP1, scoreP2);
	
// 			ctx.fillStyle = "white";
// 			ctx.font = "120px 'VT323'";
// 			ctx.textAlign = "center";
// 			ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
	
// 			return;
// 		}
		
// 		if (resuming)
// 		{
// 			const now = performance.now();
// 			if (now >= nextCountdownTime) {
// 				countdown--;
// 				nextCountdownTime = now + 1000;
// 			}
	
// 			if (countdown <= 0) {
// 				resuming = false;
// 			} else {
// 				draw_score(ctx, canvas, scoreP1, scoreP2);
	
// 				ctx.fillStyle = "white";
// 				ctx.font = "150px 'VT323'";
// 				ctx.textAlign = "center";
// 				ctx.fillText(`${countdown}`, canvas.width / 2, canvas.height / 2);
	

// 				ctx.fillStyle = "grey";
// 				ctx.beginPath();

// 				for (let i = 0; i < canvas.height; i += 20)
// 				{
// 					if (i < 360 || i > 460)
// 						ctx.rect(canvas.width / 2 - 5 / 2, i, 10, 10)
// 				}
// 				ctx.fill();

// 				ctx.fillStyle = "white"
// 				ctx.beginPath();

// 				ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
// 				ctx.fill();

// 				ctx.rect(pad1X, pad1Y, pad1W, pad1H);
// 				ctx.rect(pad2X, pad2Y, pad2W, pad2H);
// 				ctx.fill();

// 				return; 
// 			}
// 		}

// 		draw_score(ctx, canvas, scoreP1, scoreP2);

// 		ballX += speedX;
//         ballY += speedY;

//         if (keys["w"]) pad1Y -= padSpeed;
//         if (keys["s"]) pad1Y += padSpeed;

// 		// botPalyer();
//         if (keys["ArrowUp"]) pad2Y -= padSpeed;
//         if (keys["ArrowDown"]) pad2Y += padSpeed;

//         pad1Y = Math.max(0, Math.min(canvas.height - pad1H, pad1Y))
//         pad2Y = Math.max(0, Math.min(canvas.height - pad2H, pad2Y))

//         if (!paused && !gameOver)
// 		{
// 			if (ballX >= canvas.width - ballRadius)
//             	score(1);
// 			if (ballX <= 0 + ballRadius)
// 				score(2);
// 		}

//         if (ballY <= 0 + ballRadius || ballY >= canvas.height - ballRadius)
//             speedY *= -1;

//         if (ballX - ballRadius < pad1X + pad1W && 
//             ballY > pad1Y && 
//             ballY < pad1Y + pad1H
//         )
//         {
//             let relativeIntersectY = (pad1Y + pad1H / 2) - ballY;

//             let normalizedIntersectY = relativeIntersectY / (pad1H / 2);
//             speedY = -normalizedIntersectY * maxBounceAngle;

//             speedX *= -1;
//             ballX = pad1X + pad1W + ballRadius;
//         }

//         if (ballX + ballRadius > pad2X && 
//             ballY + ballRadius > pad2Y && 
//             ballY + ballRadius < pad2Y + pad2H &&
//             speedX > 0
//         )
//         {
//             let relativeIntersectY = (pad2Y + pad2H / 2) - ballY;

//             let normalizedIntersectY = relativeIntersectY / (pad2H / 2);
//             speedY = -normalizedIntersectY * maxBounceAngle;

//             speedX *= -1;
//             ballX = pad2X - ballRadius;
//         }

//         ctx.fillStyle = "grey";
//         ctx.beginPath();

//         for (let i = 0; i < canvas.height; i += 20)
//         {
//             ctx.rect(canvas.width / 2 - 5 / 2, i, 10, 10)
//         }
// 		ctx.fill();

// 		ctx.fillStyle = "white"
// 		ctx.beginPath();

//         ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
//         ctx.fill();

//         ctx.rect(pad1X, pad1Y, pad1W, pad1H);
//         ctx.rect(pad2X, pad2Y, pad2W, pad2H);
//         ctx.fill();
//     }

// 	function frame()
// 	{
//         if (!gameStarted)
// 		{
//             drawLoader();
//         }
// 		else
// 		{
//             drawGame();
//         }
//         requestAnimationFrame(frame);
//     }

// 	frame();
// }
  