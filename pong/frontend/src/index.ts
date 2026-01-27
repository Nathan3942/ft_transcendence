/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/19 16:02:15 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/27 12:01:51 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { startPong } from "./game/pong";
import type { PongInput, PongState } from "./game/pong_core";
import { makeAIPolicyP2 } from "./game/ai/policy";
import type { Genome } from "./game/ai/type";
import type { GAConfig } from "./game/ai/type";
import AIWorker from "./game/ai/worker?worker";
import hardGenome from "./game/ai/genomes/hard.json";

// import { HARD as hardGenome } from "./game/ai/genomes/hard";

// ================= Difficulty presets ===================

type AIDifficulty = "off" | "easy" | "medium" | "hard";

const GA_DEFAULT: GAConfig = {
	popSize: 120,
	elitism: 0.15,
	mutationRate: 0.40,
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

// Dernier genome entraîné (si tu ajoutes plus tard un training worker)
let lastTrainedGenome: Genome | null = null;

// ================= Difficulty selection ===================

function genomeForDifficulty(diff: AIDifficulty): Genome | null {
	if (diff === "off") return null;
	if (diff === "easy") return AI_EASY;
	if (diff === "medium") return AI_MEDIUM;
	// hard = fichier hard.json versionné
	return hardGenome as Genome;
}

// ================= Keyboard (mapping identique à ton pong.ts) ===================

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
		},
	};

	keysPressed["Enter"] = false;
	keysPressed["Escape"] = false;

	return input;
}

// ================= Helpers ===================

function mergeKeyboardWithAIP2(kb: PongInput, ai: PongInput): PongInput {
	return {
		...kb,
		p2: {
			...kb.p2, // start/pause viennent du clavier
			up: ai.p2.up,
			down: ai.p2.down,
		},
	};
}

function getDifficultyFromURL(): AIDifficulty {
	// Exemple: /?ai=easy | medium | hard | off
	const params = new URLSearchParams(window.location.search);
	const ai = (params.get("ai") ?? "off").toLowerCase();
	if (ai === "easy" || ai === "medium" || ai === "hard" || ai === "off") return ai;
	return "off";
}

// ================= Main ===================

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
if (!canvas) throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2D context not found");

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Lance le pong
const controller = startPong(canvas, ctx, { mode: "1v1" });

// Clavier (car on remplace inputSource)
const keysDown = createKeyMap();
const keysPressed = createKeyMap();
const unbind = bindKeyboard(keysDown, keysPressed);

// Choix difficulté (par URL : ?ai=easy|medium|hard|off)
const difficulty: AIDifficulty = getDifficultyFromURL();
const genome = genomeForDifficulty(difficulty);
const aiPolicy = genome ? makeAIPolicyP2(genome) : null;

// Input source injectée
controller.setInputSource((state: PongState, dt: number) => {
	const kb = keyboardToInput(keysDown, keysPressed);
	if (!aiPolicy) return kb;
	const ai = aiPolicy(state, dt);
	return mergeKeyboardWithAIP2(kb, ai);
});

// ================= Minimal export button (no UI / no panel) ===================

declare global {
	interface Window {
		exportHardGenome?: () => void;
	}
}

window.exportHardGenome = () => {
	const g = lastTrainedGenome ?? (hardGenome as Genome);
	downloadJSON("hard.json", g);
	// eslint-disable-next-line no-console
	console.log("[PONG] hard.json downloaded. Replace src/game/ai/genomes/hard.json then git commit.");
};

// =============== Worker ========================
const worker = new AIWorker() as Worker;
let training = false;

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

declare global {
	interface window {
		trainHardAI?: () => void;
		stopTrainingAI?: () => void;
		exportHardGenome?: () => void;
	}
}

window.trainHardAI = () => {
	if (training) return;
	training = true;
	console.log("[GA] training start...");
	worker.postMessage({ type: "train", cfg: GA_DEFAULT });
};

window.stopTrainingAI = () => {
	if (training) return;
	console.log("[GA] stop requested...");
	worker.postMessage({ type: "stop" });
	training = false;
};


// Debug console minimal
if (difficulty !== "off") {
	// eslint-disable-next-line no-console
	console.log(`[PONG] AI difficulty = ${difficulty}`, genome);
} else {
	// eslint-disable-next-line no-console
	console.log("[PONG] AI disabled (use ?ai=easy|medium|hard)");
}

// Cleanup SPA
window.addEventListener("beforeunload", () => {
	unbind();
	controller.stop();
});
