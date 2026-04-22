import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import createBackButton from "../components/button/backButton";
import { t } from "../i18n/i18n";
import { startPong } from "../game/pong.js";
import { type PongInput, type PongState, type PongEvents, fitCanvasToDisplay } from "../game/pong_core.js";
import { makeAIPolicyP2 } from "../game/ai/policy.js";
import type { Genome, GAConfig } from "../game/ai/type.js";
import hardGenome from "../game/ai/genomes/hard.json";
import { getLocalId } from "../helpers/apiHelper.js";
import { getRouter } from "../handler/routeHandler.js";

// Vite worker import
import AIWorker from "../game/ai/worker?worker";

// ================= Difficulty presets ===================

type AIDifficulty = "easy" | "medium" | "hard";

const GA_DEFAULT: GAConfig = {
	popSize: 50,
	elitism: 0.15,
	mutationRate: 0.4,
	mutationSigma: 0.6,
	generation: 50,
	episodesPerGenome: 6,
};

const AI_EASY: Genome = {
	anticipation: 0.35,
	reaction: 0.0,
	deadZone: 55,
	mistake: 0.30,
	jitter: 30,
};

const AI_MEDIUM: Genome = {
	anticipation: 0.65,
	reaction: 0.0,
	deadZone: 22,
	mistake: 0.12,
	jitter: 12,
};

export async function loadHardGenome(): Promise<Genome> {
	const res = await fetch("../game/ai/genome/hard.json", { cache: "no-cache" });
	if (!res.ok)
		throw new Error(`Cannot load /ai/genome/hard.json (${res.status})`);
	return (await res.json()) as Genome;
}

export function genomeForDifficulty(diff: AIDifficulty, hard: Genome): Genome {
	if (diff === "easy")
		return AI_EASY;
	if (diff === "medium")
		return AI_MEDIUM;
	return hard;
}

// ================= Keyboard ===================

type KeyMap = Record<string, boolean>;

type TouchState = {
	active: boolean;
	y: number | null;
	startPressed: boolean;
};

export function createKeyMap(): KeyMap {
	return Object.create(null);
}

export function bindKeyboard(keysDown: KeyMap, keysPressed: KeyMap) {
	const down = (e: KeyboardEvent) => {
		if (!keysDown[e.key] && !e.repeat)
			keysPressed[e.key] = true;
		keysDown[e.key] = true;
	};

	const up = (e: KeyboardEvent) => {
		keysDown[e.key] = false;
	};

	window.addEventListener("keydown", down);
	window.addEventListener("keyup", up);

	return () => {
		window.removeEventListener("keydown", down);
		window.removeEventListener("keyup", up);
	};
}

function createTouchState(): TouchState {
	return {
		active: false,
		y: null,
		startPressed: false,
	};
}

function bindTouch(canvas: HTMLCanvasElement, touchState: TouchState) {
	const getCanvasPos = (touch: Touch) => {
		const rect = canvas.getBoundingClientRect();

		return {
			x: (touch.clientX - rect.left) * (canvas.width / rect.width),
			y: (touch.clientY - rect.top) * (canvas.height / rect.height),
		};
	};

	const updateFromTouch = (e: TouchEvent) => {
		if (e.touches.length === 0)
			return;

		const touch = e.touches[0];
		const pos = getCanvasPos(touch);

		touchState.active = true;
		touchState.y = pos.y;
	};

	const onTouchStart = (e: TouchEvent) => {
		e.preventDefault();
		touchState.startPressed = true;
		updateFromTouch(e);
	};

	const onTouchMove = (e: TouchEvent) => {
		e.preventDefault();
		updateFromTouch(e);
	};

	const onTouchEnd = (e: TouchEvent) => {
		e.preventDefault();

		if (e.touches.length > 0) {
			const pos = getCanvasPos(e.touches[0]);
			touchState.active = true;
			touchState.y = pos.y;
			return;
		}

		touchState.active = false;
		touchState.y = null;
	};

	canvas.addEventListener("touchstart", onTouchStart, { passive: false });
	canvas.addEventListener("touchmove", onTouchMove, { passive: false });
	canvas.addEventListener("touchend", onTouchEnd, { passive: false });
	canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });

	return () => {
		canvas.removeEventListener("touchstart", onTouchStart);
		canvas.removeEventListener("touchmove", onTouchMove);
		canvas.removeEventListener("touchend", onTouchEnd);
		canvas.removeEventListener("touchcancel", onTouchEnd);
	};
}

export function keyboardToInput(keysDown: KeyMap, keysPressed: KeyMap): PongInput {
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
		p3: { up: false, down: false },
		p4: { up: false, down: false },
	};

	keysPressed["Enter"] = false;
	keysPressed["Escape"] = false;
	return input;
}

function touchToInput(state: PongState, touchState: TouchState): PongInput {
	const input: PongInput = {
		p1: {
			up: false,
			down: false,
			start: touchState.startPressed,
			togglePause: false,
		},
		p2: {
			up: false,
			down: false,
			start: false,
			togglePause: false,
		},
		p3: { up: false, down: false },
		p4: { up: false, down: false },
	};

	touchState.startPressed = false;

	if (!touchState.active || touchState.y === null)
		return input;

	const centerY = state.playY + state.playH / 2;
	const deadZone = Math.max(20, state.playH * 0.08);

	if (touchState.y < centerY - deadZone)
		input.p1.up = true;
	else if (touchState.y > centerY + deadZone)
		input.p1.down = true;

	return input;
}

export function mergeKeyboardWithAIP2(kb: PongInput, ai: PongInput): PongInput {
	return {
		...kb,
		p2: {
			...kb.p2,
			up: ai.p2.up,
			down: ai.p2.down,
		},
	};
}

function mergePlayer1Inputs(a: PongInput, b: PongInput): PongInput {
	return {
		...a,
		p1: {
			up: a.p1.up || b.p1.up,
			down: a.p1.down || b.p1.down,
			start: !!a.p1.start || !!b.p1.start,
			togglePause: !!a.p1.togglePause || !!b.p1.togglePause,
		},
	};
}

// ================= Export genome helper ===================

function downloadJSON(filename: string, obj: unknown) {
	const data = JSON.stringify(obj, null, 2);
	const blob = new Blob([data], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();

	URL.revokeObjectURL(url);
}

declare global {
	interface Window {
		trainHardAI?: () => void;
		stopTrainingAI?: () => void;
		exportHardGenome?: () => void;
	}
}

// ================= Cleanup session ===================

type AIGameSession = {
	cleanup: () => void;
};

let activeAISession: AIGameSession | null = null;

function cleanupAIGame(): void {
	if (!activeAISession)
		return;
	activeAISession.cleanup();
	activeAISession = null;
}

async function saveAIMatchResult(
	p1Id: number | null,
	s1: number,
	s2: number,
	winner: 1 | 2,
	diff: AIDifficulty
): Promise<void> {
	try {
		await fetch("/api/v1/matches/result", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				player1Id: p1Id,
				player2Id: null,
				scorePlayer1: s1,
				scorePlayer2: s2,
				winnerId: winner === 1 ? p1Id : null,
				mode: "ai",
			}),
		});
		console.log(`Match vs IA sauvegardé : Player 1 ${s1} - ${s2} AI (${diff})`);
	} catch (err) {
		console.error("Erreur sauvegarde match:", err);
	}
}

// ================= Page game init ===================

async function InitAiGame(diffNum: number, pageRoot: HTMLDivElement): Promise<void> {
	cleanupAIGame();

	const diff: AIDifficulty =
		diffNum === 1 ? "easy" : diffNum === 2 ? "medium" : "hard";

	const p1Id = getLocalId();

	pageRoot.innerHTML = "";
	pageRoot.style.width = "100vw";
	pageRoot.style.height = "80vh";
	pageRoot.style.display = "block";

	const canvas = document.createElement("canvas");
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	canvas.style.touchAction = "none";
	pageRoot.appendChild(canvas);

	const ctx = canvas.getContext("2d");
	if (!ctx)
		throw new Error("2D context not supported");

	const rect = pageRoot.getBoundingClientRect();
	canvas.width = rect.width || window.innerWidth;
	canvas.height = rect.height || window.innerHeight;

	const genome = genomeForDifficulty(diff, hardGenome as Genome);
	const aiPolicy = makeAIPolicyP2(genome);

	await (document as any).fonts?.ready;

	let matchSaved = false;
	let inGameOver = false;

	const events: PongEvents = {
		onStateChange: (phase) => {
			if (phase === "GAMEOVER") {
				inGameOver = true;
				return;
			}
			if (inGameOver && phase === "COUNTDOWN") {
				matchSaved = false;
				inGameOver = false;
			}
		},
		onGameOver: async (winner: 1 | 2 | 3 | 4, s1: number, s2: number) => {
			if (winner !== 1 && winner !== 2)
				return;
			if (matchSaved)
				return;

			matchSaved = true;
			await saveAIMatchResult(p1Id, s1, s2, winner, diff);
		},
	};

	fitCanvasToDisplay(canvas);

	const controller = startPong(
		canvas,
		ctx,
		{ mode: "1v1", tournament: false },
		{},
		events
	);

	const keysDown = createKeyMap();
	const keysPressed = createKeyMap();
	const unbindKeys = bindKeyboard(keysDown, keysPressed);

	const touchState = createTouchState();
	const unbindTouch = bindTouch(canvas, touchState);

	controller.setInputSource((state: PongState, dt: number) => {
		const kb = keyboardToInput(keysDown, keysPressed);
		const touch = touchToInput(state, touchState);
		const playerInput = mergePlayer1Inputs(kb, touch);
		const ai = aiPolicy(state, dt);
		return mergeKeyboardWithAIP2(playerInput, ai);
	});

	const onResize = () => {
		fitCanvasToDisplay(canvas);
		controller.resize(canvas.width, canvas.height);
	};

	window.addEventListener("resize", onResize);

	const worker = new AIWorker() as Worker;
	let training = false;
	let lastTrainedGenome: Genome | null = null;

	worker.onmessage = (e) => {
		const msg = e.data;

		if (msg.type === "progress") {
			lastTrainedGenome = msg.bestGenome as Genome;
			console.log(
				`[GA] gen=${msg.gen} bestFit=${Math.round(msg.bestFitness)} genBestFit: ${msg.genBestFit}, genAvgFit: ${msg.genAvgFit}, genWorstFit: ${msg.genWorstFit}`,
				msg.bestGenome
			);
			return;
		}

		if (msg.type === "done") {
			training = false;
			lastTrainedGenome = msg.bestGenome as Genome;
			console.log(`[GA] DONE bestFit=${Math.round(msg.bestFitness)}`, msg.bestGenome);
			return;
		}

		if (msg.type === "error") {
			training = false;
			console.error("[GA] ERROR:", msg.msg);
			return;
		}

		if (msg.type === "debug") {
			console.log("[GA]", msg.msg);
		}
	};

	window.trainHardAI = () => {
		if (training)
			return;
		training = true;
		console.log("[GA] training start...");
		worker.postMessage({ type: "train", cfg: GA_DEFAULT });
	};

	window.stopTrainingAI = () => {
		if (!training)
			return;
		console.log("[GA] stop requested...");
		worker.postMessage({ type: "stop" });
		training = false;
	};

	window.exportHardGenome = () => {
		const g = lastTrainedGenome ?? hardGenome;
		downloadJSON("hard.json", g);
		console.log("[PONG] hard.json downloaded. Mets-le dans public/ai/hard.json puis git commit.");
	};

	const onBeforeUnload = () => {
		cleanupAIGame();
	};

	window.addEventListener("beforeunload", onBeforeUnload);
	const onPopState = () => {
		cleanupAIGame();
	};

	const onNavigate = (ev: any) => {
		const nextPath = ev?.detail?.path as string | undefined;
		if (!nextPath)
			return;

		if (nextPath !== "/game-local-ai")
			cleanupAIGame();
	};

	window.addEventListener("navigate", onNavigate as any);
	window.addEventListener("popstate", onPopState);


	activeAISession = {
		cleanup: () => {
			window.removeEventListener("resize", onResize);
			window.removeEventListener("beforeunload", onBeforeUnload);
			window.removeEventListener("navigate", onNavigate as any);
			window.removeEventListener("popstate", onPopState);

			unbindKeys();
			unbindTouch();

			controller.stop();
			worker.terminate();

			window.trainHardAI = undefined;
			window.stopTrainingAI = undefined;
			window.exportHardGenome = undefined;
		},
	};

	console.log(`[PONG] AI difficulty = ${diff}`, genome);
	console.log("[PONG] Console commands: trainHardAI(), stopTrainingAI(), exportHardGenome()");
}

export default function createLocalAIGamePage(): HTMLDivElement {
	cleanupAIGame();

	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end";
	inner.className =
		"text-3xl w-full md:w-9/12 flex flex-col items-center md:items-end gap-4 py-4 md:h-2/3 md:justify-evenly md:gap-0 md:py-0";

	outer.append(createBackButton("bg-blue-300 dark:bg-blue-900", "/game-local"));

	const btnClasses = "flex flex-row p-4 w-full";

	inner.append(
		makeButtonBlock(
			"bg-cyan-300 dark:bg-cyan-900",
			createButton({
				id: "diff-easy-btn",
				extraClasses: btnClasses,
				buttonText: t("gameLocalAi.easy"),
				f: () => {
					void InitAiGame(1, outer);
				},
			})
		),
		makeButtonBlock(
			"bg-sky-300 dark:bg-sky-900",
			createButton({
				id: "diff-medium-btn",
				extraClasses: btnClasses,
				buttonText: t("gameLocalAi.medium"),
				f: () => {
					void InitAiGame(2, outer);
				},
			})
		),
		makeButtonBlock(
			"bg-indigo-300 dark:bg-indigo-900",
			createButton({
				id: "diff-hard-btn",
				extraClasses: btnClasses,
				buttonText: t("gameLocalAi.hard"),
				f: () => {
					void InitAiGame(3, outer);
				},
			})
		)
	);

	const backToLocal = createBackButton("bg-blue-300 dark:bg-blue-900", "/game-local");
	backToLocal.addEventListener("click", () => {
		cleanupAIGame();
		getRouter().lazyLoad("/game-local");
	});

	outer.innerHTML = "";
	outer.append(backToLocal);
	outer.appendChild(inner);

	return outer;
}