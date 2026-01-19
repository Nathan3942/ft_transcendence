/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/19 16:02:15 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/19 16:33:52 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { startPong } from "./game/pong";
import type { PongInput, PongState } from "./game/pong_core";
import { makeAIPolicyP2 } from "./game/ai/policy";
import type { GAConfig, Genome } from "./game/ai/type";

// Vite worker import (recommandé)
import AIWorker from "./game/ai/worker?worker";

// ---------------- Keyboard (copie de ton mapping) ----------------

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

  // reset edge-trigger
  keysPressed["Enter"] = false;
  keysPressed["Escape"] = false;

  return input;
}

// ---------------- Small UI helper ----------------

function makePanel() {
  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.right = "12px";
  panel.style.bottom = "12px";
  panel.style.padding = "10px";
  panel.style.background = "rgba(0,0,0,0.6)";
  panel.style.color = "white";
  panel.style.fontFamily = "monospace";
  panel.style.fontSize = "12px";
  panel.style.borderRadius = "8px";
  panel.style.zIndex = "9999";
  panel.innerHTML = `
    <div id="ai-status">AI: idle</div>
    <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
      <button id="ai-toggle">Enable AI</button>
      <button id="ai-train">Train</button>
      <button id="ai-stop">Stop</button>
      <button id="ai-clear">Clear genome</button>
    </div>
  `;
  document.body.appendChild(panel);
}

function setStatus(s: string) {
  const el = document.getElementById("ai-status");
  if (el) el.textContent = s;
}

// ---------------- Main ----------------

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
if (!canvas) throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas context 2D not found");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

makePanel();

const controller = startPong(canvas, ctx, { mode: "1v1" });

const LS_KEY = "pong_ai_genome";

const keysDown = createKeyMap();
const keysPressed = createKeyMap();
const unbindKeys = bindKeyboard(keysDown, keysPressed);

// état IA
let aiEnabled = false;
let currentGenome: Genome | null = null;
let currentPolicy: ((s: PongState, dt: number) => PongInput) | null = null;

// compose input: clavier pour tout, IA écrase p2 si activée
controller.setInputSource((state, dt) => {
  const kb = keyboardToInput(keysDown, keysPressed);

  if (!aiEnabled || !currentPolicy) return kb;

  const ai = currentPolicy(state, dt);

  // IMPORTANT: on garde start/pause du clavier aussi
  // (et on laisse l'IA uniquement sur up/down de P2)
  return {
    ...kb,
    p2: {
      ...kb.p2,
      up: ai.p2.up,
      down: ai.p2.down,
    },
  };
});

function loadGenome(): Genome | null {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Genome;
  } catch {
    return null;
  }
}

function applyGenome(g: Genome) {
  currentGenome = g;
  currentPolicy = makeAIPolicyP2(g);
  localStorage.setItem(LS_KEY, JSON.stringify(g));

  setStatus(aiEnabled ? "AI: enabled (genome loaded)" : "AI: genome loaded (disabled)");
}

// charge au boot
const saved = loadGenome();
if (saved) applyGenome(saved);

// ---------------- Worker training ----------------

const worker = new AIWorker() as Worker;
let training = false;

worker.onmessage = (e: MessageEvent<any>) => {
  const msg = e.data;

  if (msg.type === "progress") {
    // msg: { type:"progress", gen, bestFitness, bestGenome }
    setStatus(`AI training: gen=${msg.gen} bestFit=${Math.round(msg.bestFitness)}`);
    applyGenome(msg.bestGenome as Genome); // live update
    return;
  }

  if (msg.type === "done") {
    training = false;
    setStatus(`AI done: bestFit=${Math.round(msg.bestFitness)}`);
    applyGenome(msg.bestGenome as Genome);
    return;
  }
};

const GA_DEFAULT: GAConfig = {
  popSize: 80,
  elitism: 0.15,
  mutationRate: 0.25,
  mutationSigma: 0.08,
  generation: 60,
  episodesPerGenome: 4,
};

// ---------------- Buttons ----------------

const btnToggle = document.getElementById("ai-toggle") as HTMLButtonElement;
const btnTrain = document.getElementById("ai-train") as HTMLButtonElement;
const btnStop = document.getElementById("ai-stop") as HTMLButtonElement;
const btnClear = document.getElementById("ai-clear") as HTMLButtonElement;

btnToggle.onclick = () => {
  aiEnabled = !aiEnabled;

  if (aiEnabled) {
    if (!currentPolicy) {
      const g = loadGenome();
      if (g) applyGenome(g);
      else setStatus("AI enabled, but no genome saved (train first)");
    } else {
      setStatus("AI: enabled");
    }
    btnToggle.textContent = "Disable AI";
  } else {
    setStatus("AI: disabled");
    btnToggle.textContent = "Enable AI";
  }
};

btnTrain.onclick = () => {
  if (training) return;
  training = true;
  setStatus("AI training: starting...");
  worker.postMessage({ type: "train", cfg: GA_DEFAULT });
};

btnStop.onclick = () => {
  if (!training) return;
  worker.postMessage({ type: "stop" });
  training = false;
  setStatus("AI: stopped");
};

btnClear.onclick = () => {
  localStorage.removeItem(LS_KEY);
  currentGenome = null;
  currentPolicy = null;
  setStatus("AI: genome cleared");
};

// bouton init
btnToggle.textContent = aiEnabled ? "Disable AI" : "Enable AI";

// cleanup si tu veux (SPA)
window.addEventListener("beforeunload", () => {
  unbindKeys();
  controller.stop();
});

