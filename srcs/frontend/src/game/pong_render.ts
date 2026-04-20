/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong_render.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/23 16:55:07 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/20 04:07:32 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { RenderState, GameSlot } from "./server_state_adapter.js";
import { t } from "../i18n/i18n";

function px(n: number): number {
	return Math.round(n) + 0.5;
}

export function drawPong(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: RenderState, mySlot: GameSlot | null) {

	// backgroud
	ctx.fillStyle = "black";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const minDim = Math.min(state.playW, state.playH);

	// tailles responsives
	const borderSize = Math.max(1, minDim * 0.004);
	const dashSize = Math.max(4, minDim * 0.012);
	const dashGap = Math.max(6, minDim * 0.02);
	const ballRadius = Math.max(4, minDim * 0.012);
	const scoreFontSize = Math.max(24, minDim * 0.16);
	const countdownFontSize = Math.max(36, minDim * 0.18);
	const uiPadding = Math.max(8, minDim * 0.03);
	const lifeSize = Math.max(6, minDim * 0.012);
	const lifeGap = Math.max(8, minDim * 0.025);

	// playfield
	ctx.strokeStyle = "white";
	ctx.lineWidth = borderSize;
	ctx.strokeRect(Math.round(state.playX) + 0.5, Math.round(state.playY) + 0.5, Math.round(state.playW), Math.round(state.playH));

	const cx = state.playX + state.playW / 2;

	if (state.mode === "1v1" || state.mode === "2v2") {
		// ligne du milieu
		ctx.fillStyle = "grey";
		const midX = state.playX + state.playW / 2 - dashSize / 2;

		for (let y = state.playY + uiPadding; y < state.playY + state.playH - uiPadding; y += dashSize + dashGap) {
			ctx.fillRect(midX, y, dashSize, dashSize);
		}

		// score responsive
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = `${scoreFontSize}px 'VT323'`;

		const scoreOffsetX = Math.max(30, Math.floor(state.playW * 0.1));
		const yScore = state.playY + Math.max(30, Math.floor(state.playH * 0.12));

		ctx.fillText(String(state.scoreLeft), cx - scoreOffsetX, yScore);
		ctx.fillText(String(state.scoreRight), cx + scoreOffsetX, yScore);
	}
	else {
		const leftLife = state.paddles.find(p => p.slot === "left")?.life ?? 0;
		const rightLife = state.paddles.find(p => p.slot === "right")?.life ?? 0;
		const topLife = state.paddles.find(p => p.slot === "top")?.life ?? 0;
		const bottomLife = state.paddles.find(p => p.slot === "bottom")?.life ?? 0;

		const pfLeft = state.playX;
		const pfTop = state.playY;
		const pfRight = state.playX + state.playW;
		const pfBottom = state.playY + state.playH;

		// left
		ctx.fillStyle = mySlot === "left" ? "#00ff88" : "white";
		for (let i = 0; i < leftLife; i++) {
			ctx.fillRect(pfLeft + uiPadding, pfBottom - uiPadding - lifeSize - i * lifeGap, lifeSize, lifeSize);
		}

		// right
		ctx.fillStyle = mySlot === "right" ? "#00ff88" : "white";
		for (let i = 0; i < rightLife; i++) {
			ctx.fillRect(pfRight - uiPadding - lifeSize, pfTop + uiPadding + i * lifeGap, lifeSize, lifeSize);
		}

		// top
		ctx.fillStyle = mySlot === "top" ? "#00ff88" : "white";
		for (let i = 0; i < topLife; i++) {
			ctx.fillRect(pfLeft + uiPadding + i * lifeGap, pfTop + uiPadding, lifeSize,	lifeSize);
		}

		// bottom
		ctx.fillStyle = mySlot === "bottom" ? "#00ff88" : "white";
		for (let i = 0; i < bottomLife; i++) {
			ctx.fillRect(pfRight - uiPadding - lifeSize - i * lifeGap, pfBottom - uiPadding - lifeSize, lifeSize, lifeSize);
		}
	}

	// paddles
	for (const p of state.paddles) {
		if (!p.activate)
			continue;

		const isMine = mySlot && p.slot === mySlot;
		ctx.fillStyle = isMine ? "#00ff88" : "white";
		ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.w),	Math.round(p.h));
	}

	// ball
	ctx.beginPath();
	ctx.fillStyle = "white";
	ctx.arc(state.ballX, state.ballY, ballRadius, 0, Math.PI * 2);
	ctx.fill();

	// overlay countdown / ended
	if (state.phase === "COUNTDOWN") {
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = `${countdownFontSize}px 'VT323'`;
		ctx.fillText(String(state.countdown), state.playX + state.playW / 2, state.playY + state.playH / 2);
	}

	if (state.phase === "ENDED") {
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = `${Math.max(24, Math.floor(minDim * 0.08))}px 'VT323'`;
		ctx.fillText(t("ingameMsg.ended"), state.playX + state.playW / 2, state.playY + state.playH / 2);
	}
}


