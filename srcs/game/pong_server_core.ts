/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong_server_core.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/02 19:31:45 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/02 19:35:31 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
	DEFAULT_CONFIG,
	creatInitialState,
	updateCore,
	type ModeId,
	type PongConfig,
	type PongEvents,
	type PongInput,
	type PongState,
} from "../frontend/src/game/pong_core"; // ou mieux: déplacer pong_core dans /shared

export type GameSlot =
	| "left" | "right"
	| "left1" | "left2" | "right1" | "right2"
	| "top" | "bottom";

export type PaddleInput = { dir: -1 | 0 | 1; ts: number };

export type ServerPaddle = { axis: "x" | "y"; pos: number; vel: number };

export type ServerGameState = {
	id: string;
	status: "waiting" | "running" | "finished";
	mode: ModeId;

	score: { left: number; right: number };
	ball: { x: number; y: number; vx: number; vy: number };

	// ⚠️ je conseille "paddles" (pluriel) partout
	paddles: Partial<Record<GameSlot, ServerPaddle>>;

	play: { x: number; y: number; w: number; h: number };
	phase: PongState["phase"]; // optionnel, pratique
};

function slotsForMode(mode: ModeId): GameSlot[] {
	switch (mode) {
		case "2v2":
			return ["left1", "left2", "right1", "right2"];
		case "3p":
			return ["left", "right", "top"];
		case "4p":
			return ["left", "right", "top", "bottom"];
		default:
			return ["left", "right"];
	}
}

function slotToPaddleIndex(mode: ModeId, slot: GameSlot): number | null {
	// Important: doit matcher l’ordre d’initPaddles dans pong_core
	// 1v1: [LEFT, RIGHT]
	// 2v2: [LEFT lane0, RIGHT lane0, LEFT lane1, RIGHT lane1]
	// 3p:  [LEFT, RIGHT, TOP, BOTTOM(inactif)]
	// 4p:  [LEFT, RIGHT, TOP, BOTTOM]
	if (mode === "1v1") {
		if (slot === "left")
			return 0;
		if (slot === "right")
			return 1;
		return null;
	}
	if (mode === "2v2") {
		if (slot === "left1")
			return 0;
		if (slot === "right1")
			return 1;
		if (slot === "left2")
			return 2;
		if (slot === "right2")
			return 3;
		return null;
	}
	if (mode === "3p") {
		if (slot === "left")
			return 0;
		if (slot === "right")
			return 1;
		if (slot === "top")
			return 2;
		return null;
	}
	if (mode === "4p") {
		if (slot === "left")
			return 0;
		if (slot === "right")
			return 1;
		if (slot === "top")
			return 2;
		if (slot === "bottom")
			return 3;
		return null;
	}
	return null;
}

function applyDirToPongInput(mode: ModeId, inputs: Partial<Record<GameSlot, PaddleInput>>): PongInput {
	// Ici on transforme tes "dir" en up/down du PongInput
	const mk = (dir: -1 | 0 | 1) => ({ up: dir === -1, down: dir === 1 });

	// par défaut tout à false
	const out: PongInput = {
		p1: mk(0),
		p2: mk(0),
		p3: mk(0),
		p4: mk(0),
	};

	for (const slot of slotsForMode(mode)) {
		const idx = slotToPaddleIndex(mode, slot);
		if (idx === null)
			continue;

		const dir = (inputs[slot]?.dir ?? 0) as -1 | 0 | 1;

		// mapping index -> p1..p4
		if (idx === 0)
			out.p1 = mk(dir);
		else if 
			(idx === 1) out.p2 = mk(dir);
		else if
			(idx === 2) out.p3 = mk(dir);
		else if
			(idx === 3) out.p4 = mk(dir);
	}

	// start/togglePause : à toi de décider comment tu le déclenches en online
	// (souvent: auto-start quand match_ready)
	return out;
}

export function createServerGame(id: string, mode: ModeId, canvasW: number, canvasH: number, cfg?: Partial<PongConfig>) {
	const config: PongConfig = { ...DEFAULT_CONFIG, ...(cfg ?? {}) };
	const state = creatInitialState(mode, canvasW, canvasH, config);

	return { id, mode, config, state };
}

export function tickServerGame(
	game: { id: string; mode: ModeId; config: PongConfig; state: PongState },
	dt: number,
	inputs: Partial<Record<GameSlot, PaddleInput>>,
	events?: PongEvents
): ServerGameState {
	const input = applyDirToPongInput(game.mode, inputs);
	updateCore(game.state, input, dt, game.config, events);

	// Snapshot sérialisable
	const paddles: Partial<Record<GameSlot, ServerPaddle>> = {};
	for (const slot of slotsForMode(game.mode)) {
		const idx = slotToPaddleIndex(game.mode, slot);
		if (idx === null)
			continue;
		const p = game.state.paddles[idx];
		if (!p || p.activate === false)
			continue;

		const axis = (p.side === "TOP" || p.side === "BOTTOM") ? "x" : "y";
		paddles[slot] = { axis, pos: p.pos, vel: 0 }; // vel: optionnel
	}

	return {
		id: game.id,
		status: game.state.phase === "GAMEOVER" ? "finished" : (game.state.phase === "RUNNING" ? "running" : "waiting"),
		mode: game.mode,
		score: { left: game.state.scoreP1, right: game.state.scoreP2 },
		ball: { x: game.state.ballX, y: game.state.ballY, vx: game.state.ballVX, vy: game.state.ballVY },
		paddles,
		play: { x: game.state.playX, y: game.state.playY, w: game.state.playW, h: game.state.playH },
		phase: game.state.phase,
	};
}