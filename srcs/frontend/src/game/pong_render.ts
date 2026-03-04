/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong_render.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/23 16:55:07 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/04 12:13:45 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { RenderState, GameSlot } from "./server_state_adapter";

export function drawPong(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: RenderState, mySlot: GameSlot | null) {

	// background
	ctx.fillStyle = "black";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// playfield
	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;
	ctx.strokeRect(state.playX, state.playY, state.playW, state.playH);

	// title
	// ctx.fillStyle = "white";
	// ctx.font = "120px 'VT323'";
	// ctx.textAlign = "center";
	// ctx.fillText("COCO_PONG", canvas.width / 2, state.playY - 20);

	// mid dashed line (vertical)
	// score

	const cx = state.playX + (state.playW / 2);

	if (state.mode === "1v1" || state.mode === "2v2") {

		ctx.fillStyle = "grey";
		ctx.beginPath();
		const midX = state.playX + state.playW / 2 - 5;
		for (let y = state.playY + 10; y < state.playY + state.playH - 10; y += 20) {
			ctx.rect(midX, y, 10, 10);
		}
		ctx.fill();

		ctx.fillStyle = "white";
		ctx.font = "150px 'vt323'";
		
		const yScore = state.playY + 120;
		ctx.fillText(String(state.scoreLeft), cx - 100, yScore);
		ctx.fillText(String(state.scoreRight), cx + 100, yScore);
	}
	else {
		ctx.fillStyle = "white";

		const leftLife   = state.paddles.find(p => p.slot === "left")?.life ?? 0;
		const rightLife  = state.paddles.find(p => p.slot === "right")?.life ?? 0;
		const topLife    = state.paddles.find(p => p.slot === "top")?.life ?? 0;
		const bottomLife = state.paddles.find(p => p.slot === "bottom")?.life ?? 0;

		// bas/haut/left/right du playfield en coords écran
		const pfLeft = state.playX;
		const pfTop = state.playY;
		const pfRight = state.playX + state.playW;
		const pfBottom = state.playY + state.playH;

		// P1 (left) : en bas à gauche (colonne)
		
		ctx.fillStyle = (mySlot === "left") ? "#00ff88" : "white";
		ctx.beginPath();
		for (let i = 0; i < leftLife; i++) {
			ctx.rect(pfLeft + 30, pfBottom - 30 - 20 * i, 10, 10);
		}
		ctx.fill();

		// P2 (right) : en haut à droite (colonne)
		ctx.fillStyle = (mySlot === "right") ? "#00ff88" : "white";
		ctx.beginPath();
		for (let i = 0; i < rightLife; i++) {
			ctx.rect(pfRight - 40, pfTop + 20 + 20 * i, 10, 10);
		}
		ctx.fill();

		// P3 (top) : en haut à gauche (ligne)
		ctx.fillStyle = (mySlot === "top") ? "#00ff88" : "white";
		ctx.beginPath();
		for (let i = 0; i < topLife; i++) {
			ctx.rect(pfLeft + 30 + 20 * i, pfTop + 20, 10, 10);
		}
		ctx.fill();

		// P4 (bottom) : en bas à droite (ligne)
		ctx.fillStyle = (mySlot === "bottom") ? "#00ff88" : "white";
		ctx.beginPath();
		for (let i = 0; i < bottomLife; i++) {
			ctx.rect(pfRight - 40 - 20 * i, pfBottom - 30, 10, 10);
		}
		ctx.fill();
	}

	// paddles
	ctx.fillStyle = "white";
	for (const p of state.paddles) {
		if (!p.activate)
			continue;
		const isMine = mySlot && p.slot === mySlot;
		ctx.fillStyle = isMine ? "#00ff88" : "white";
		ctx.fillRect(p.x, p.y, p.w, p.h);
	}

	

	// ball
	const r = 10;
	ctx.beginPath();
	ctx.fillStyle = "white";
	ctx.arc(state.ballX, state.ballY, r, 0, Math.PI * 2);
	ctx.fill();

	// overlay waiting
	if (state.phase === "COUNTDOWN") {
		ctx.fillStyle = "white";
		ctx.font = "120px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText(String(state.countdown), state.playX + state.playW / 2, state.playY + state.playH / 2);
	}
	if (state.phase === "ENDED") {
		ctx.fillStyle = "white";
		ctx.font = "120px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText("Ended...", state.playX + state.playW / 2, state.playY + state.playH / 2);
	}
}
