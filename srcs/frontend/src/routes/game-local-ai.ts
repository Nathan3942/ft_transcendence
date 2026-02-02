import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";

import { startPong } from "../game/pong";
import type { PongInput, PongState } from "../game/pong_core";

import { makeAIPolicyP2 } from "../game/ai/policy";
import type { Genome, GAConfig } from "../game/ai/type";

import hardGenome from "../game/ai/genomes/hard.json";

// Vite worker import
import AIWorker from "../game/ai/worker?worker";

// ================= Difficulty presets ===================

type AIDifficulty = "easy" | "medium" | "hard";

const GA_DEFAULT: GAConfig = {
	popSize: 120,
	elitism: 0.15,
	mutationRate: 0.4,
	mutationSigma: 0.06,
	generation: 100,
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

//	Hard genome 
async function loadHardGenome(): Promise<Genome> {
	const res = await fetch("/ai/genome/hard.json", { cache: "no-cache" });
	if (!res.ok) throw new Error(`Cannot load /ai/genome/hard.json (${res.status})`);
	return (await res.json()) as Genome;
}

function genomeForDifficulty(diff: AIDifficulty, hard: Genome): Genome {
	if (diff === "easy") return AI_EASY;
	if (diff === "medium") return AI_MEDIUM;
	return hard;
}

// ================= Keyboard ===================

type KeyMap = Record<string, boolean>;

function createKeyMap(): KeyMap {
  	return Object.create(null);
}

function bindKeyboard(keysDown: KeyMap, keysPressed: KeyMap) {
	const down = (e: KeyboardEvent) => {
		if (!keysDown[e.key] && !e.repeat) keysPressed[e.key] = true;
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
		p3: { up: false, down: false },
		p4: { up: false, down: false },
	};

	keysPressed["Enter"] = false;
	keysPressed["Escape"] = false;
	return input;
}

function mergeKeyboardWithAIP2(kb: PongInput, ai: PongInput): PongInput {
	return {
		...kb,
		p2: {
		...kb.p2,
		up: ai.p2.up,
		down: ai.p2.down,
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

// ================= Page game init ===================

async function InitAiGame(diffNum: number, pageRoot: HTMLDivElement) {

	const diff: AIDifficulty = diffNum === 1 ? "easy" : diffNum === 2 ? "medium" : "hard";

	// remplace le menu par le canvas
	pageRoot.innerHTML = "";
	pageRoot.style.width = "100vw";
	pageRoot.style.height = "80vh";
	pageRoot.style.display = "block";

	const canvas = document.createElement("canvas");
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	pageRoot.appendChild(canvas);

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("2D context not supported");

	const rect = pageRoot.getBoundingClientRect();
	canvas.width = rect.width || window.innerWidth;
	canvas.height = rect.height || window.innerHeight;

	// load hard genome
	const hardGenome = await loadHardGenome();

	// policy selon diff
	const genome = genomeForDifficulty(diff, hardGenome);
	const aiPolicy = makeAIPolicyP2(genome);

	// lance pong
	await (document as any).fonts?.ready;
	const controller = startPong(canvas, ctx, { mode: "1v1" });

	// injection IA
	const keysDown = createKeyMap();
	const keysPressed = createKeyMap();
	const unbindKeys = bindKeyboard(keysDown, keysPressed);

	controller.setInputSource((state: PongState, dt: number) => {
		const kb = keyboardToInput(keysDown, keysPressed);
		const ai = aiPolicy(state, dt);
		return mergeKeyboardWithAIP2(kb, ai);
	});

	const onResize = () => {
		const r = pageRoot.getBoundingClientRect();
		controller.reseize(r.width || window.innerWidth, r.height || window.innerHeight);
	};
	window.addEventListener("resize", onResize);

	// ======== training worker ========
	const worker = new AIWorker() as Worker;
	let training = false;
	let lastTrainedGenome: Genome | null = null;

	worker.onmessage = (e) => {
		const msg = e.data;

		if (msg.type === "progress") {
		lastTrainedGenome = msg.bestGenome as Genome;
		console.log(`[GA] gen=${msg.gen} bestFit=${Math.round(msg.bestFitness)}`, msg.bestGenome);
		}
		if (msg.type === "done") {
		training = false;
		lastTrainedGenome = msg.bestGenome as Genome;
		console.log(`[GA] DONE bestFit=${Math.round(msg.bestFitness)}`, msg.bestGenome);
		}
		if (msg.type === "error") {
		training = false;
		console.error("[GA] ERROR:", msg.msg);
		}
		if (msg.type === "debug") {
		console.log("[GA]", msg.msg);
		}
	};

	window.trainHardAI = () => {
		if (training) return;
		training = true;
		console.log("[GA] training start...");
		worker.postMessage({ type: "train", cfg: GA_DEFAULT });
	};

	window.stopTrainingAI = () => {
		if (!training) return;
		console.log("[GA] stop requested...");
		worker.postMessage({ type: "stop" });
		training = false;
	};

	window.exportHardGenome = () => {
		// export le dernier genome entraîné sinon celui versionné
		const g = lastTrainedGenome ?? hardGenome;
		downloadJSON("hard.json", g);
		console.log("[PONG] hard.json downloaded. Mets-le dans public/ai/hard.json puis git commit.");
	};

	console.log(`[PONG] AI difficulty = ${diff}`, genome);
	console.log("[PONG] Console commands: trainHardAI(), stopTrainingAI(), exportHardGenome()");

	// cleanup 
	window.addEventListener("beforeunload", () => {
		window.removeEventListener("resize", onResize);
		unbindKeys();
		controller.stop();
		worker.terminate();
	});
}


export default function createLocalAIGamePage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-blue-300 dark:bg-blue-900", createButton({
			id: "diff-easy-btn",
			extraClasses:btnClasses,
			buttonText: "Easy",
			f: () => InitAiGame(1, outer)
			})
		),
		makeButtonBlock("bg-purple-300 dark:bg-purple-900", createButton({
			id: "diff-medium-btn",
			extraClasses: btnClasses,
			buttonText: "Medium",
			f: () => InitAiGame(2, outer),
			href: "/game-local-ai-medium"
			})
		),
		makeButtonBlock("bg-red-300 dark:bg-red-900", createButton({
			id: "diff-hard-btn",
			extraClasses: btnClasses,
			buttonText: "Hard",
			f: () => InitAiGame(3, outer)
			})
		)
	);

	outer.appendChild(inner);

	return outer;
}