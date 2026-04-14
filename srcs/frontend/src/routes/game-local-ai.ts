import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import createBackButton from "../components/button/backButton";
import { t } from "../i18n/i18n";

import { startPong } from "../game/pong.js";
/* MODIF 1 : on importe PongEvents pour le callback onGameOver */
import type { PongInput, PongState, PongEvents } from "../game/pong_core.js";

/* URL de base de l'API backend */
const API_URL = `http://${window.location.hostname}:3000/api/v1`;

import { makeAIPolicyP2 } from "../game/ai/policy.js";
import type { Genome, GAConfig } from "../game/ai/type.js";

import hardGenome from "../game/ai/genomes/hard.json";
import { getLocalId } from "../helpers/apiHelper.js";

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
export async function loadHardGenome(): Promise<Genome> {
	const res = await fetch("../game/ai/genome/hard.json", { cache: "no-cache" });
	if (!res.ok)
		throw new Error(`Cannot load /ai/genome/hard.json (${res.status})`);
	return (await res.json()) as Genome;
}

export function genomeForDifficulty(diff: AIDifficulty, hard: Genome): Genome {
	if (diff === "easy") return AI_EASY;
	if (diff === "medium") return AI_MEDIUM;
	return hard;
}

// ================= Keyboard ===================

type KeyMap = Record<string, boolean>;

export function createKeyMap(): KeyMap {
  	return Object.create(null);
}

export function bindKeyboard(keysDown: KeyMap, keysPressed: KeyMap) {
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

/* MODIF 2 : InitAiGame crée maintenant les users dans le backend avant le match
   et sauvegarde le résultat via POST /matches/result quand le match se termine.
   player2Id est null car le joueur 2 est une IA (pas un vrai user) */
async function InitAiGame(diffNum: number, pageRoot: HTMLDivElement) {

	const diff: AIDifficulty = diffNum === 1 ? "easy" : diffNum === 2 ? "medium" : "hard";

	const p1Id = getLocalId();

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
	// const hardGenome = await loadHardGenome();

	// policy selon diff
	const genome = genomeForDifficulty(diff, hardGenome as Genome);

	const aiPolicy = makeAIPolicyP2(genome);

	// lance pong
	await (document as any).fonts?.ready;

	/* MODIF 3 : callback quand le match se termine → sauvegarde le résultat
	   player2Id = null car c'est une IA, pas un vrai joueur en base */
	const events: PongEvents = {
		onGameOver: async (winner: 1 | 2 | 3 | 4, s1: number, s2: number) => {
			if (winner !== 1 && winner !== 2) return;
			try {
				await fetch(`${API_URL}/matches/result`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						player1Id: p1Id,
						player2Id: null,
						scorePlayer1: s1,
						scorePlayer2: s2,
						winnerId: winner === 1 ? p1Id : null,
					}),
				});
				console.log(`Match vs IA sauvegardé : Player 1 ${s1} - ${s2} AI (${diff})`);
			} catch (err) {
				console.error("Erreur sauvegarde match:", err);
			}
		},
	};

	const controller = startPong(canvas, ctx, { mode: "1v1", tournament: false }, {}, events);

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
	inner.className = "text-3xl w-full md:w-9/12 h-2/3 flex flex-col items-center md:items-end justify-evenly";

	outer.append(createBackButton("bg-blue-300 dark:bg-blue-900", "/game-local"));

	const btnClasses = "flex flex-row p-4 w-full"; 
	inner.append(
		makeButtonBlock("bg-cyan-300 dark:bg-cyan-900", createButton({
			id: "diff-easy-btn",
			extraClasses:btnClasses,
			buttonText: t("gameLocalAi.easy"),
			f: () => InitAiGame(1, outer)
			})
		),
		makeButtonBlock("bg-sky-300 dark:bg-sky-900", createButton({
			id: "diff-medium-btn",
			extraClasses: btnClasses,
			buttonText: t("gameLocalAi.medium"),
			f: () => InitAiGame(2, outer),
			href: "/game-local-ai-medium"
			})
		),
		makeButtonBlock("bg-indigo-300 dark:bg-indigo-900", createButton({
			id: "diff-hard-btn",
			extraClasses: btnClasses,
			buttonText: t("gameLocalAi.hard"),
			f: () => InitAiGame(3, outer)
			})
		)
	);

	outer.appendChild(inner);

	return outer;
}