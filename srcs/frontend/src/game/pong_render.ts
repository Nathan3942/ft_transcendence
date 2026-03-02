/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong_render.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/23 16:55:07 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/02 18:41:56 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { RenderState } from "./server_state_adapter";

export function drawPong(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: RenderState) {

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
	ctx.fillStyle = "grey";
	ctx.beginPath();
	const midX = state.playX + state.playW / 2 - 2.5;
	for (let y = state.playY + 10; y < state.playY + state.playH - 10; y += 20) {
		ctx.rect(midX - 2.5, y, 10, 10);
	}
	ctx.fill();

	// score
	ctx.fillStyle = "white";
	ctx.font = "150px 'vt323'";
	const cx = state.playX + (state.playW / 2);
	const yScore = state.playY + 120;
	ctx.fillText(String(state.scoreLeft), cx - 150, yScore);
	ctx.fillText(String(state.scoreRight), cx + 90, yScore);

	// paddles
	ctx.fillStyle = "white";
	for (const p of state.paddles) {
		ctx.fillRect(p.x, p.y, p.w, p.h);
	}

	

	// ball
	const r = 10;
	ctx.beginPath();
	ctx.arc(state.ballX, state.ballY, r, 0, Math.PI * 2);
	ctx.fill();

	// overlay waiting
	if (state.phase === "LOBBY") {
		ctx.font = "90px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText("WAITING...", cx, state.playY + state.playH / 2);
	}
}
