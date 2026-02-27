/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong_render.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/23 16:55:07 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/27 08:36:34 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { RenderState1v1 } from "./server_state_adapter";


export function draw1v1(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: RenderState1v1) {

	ctx.fillStyle = "black";
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;
	ctx.strokeRect(state.playX, state.playY, state.playW, state.playH);
	// console.log("Playfield: ");
	// console.log(state.playX, state.playY, state.playW, state.playH);

	ctx.beginPath();
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;
	ctx.strokeRect(state.playX, state.playY, state.playW, state.playH);

	ctx.fillStyle = "white";
	ctx.font = "120px 'VT323'";
	ctx.textAlign = "center";
	ctx.fillText("COCO_PONG", canvas.width / 2, state.playY - 20);


	ctx.fillStyle = "grey";
	ctx.beginPath();
	const midX = state.playX + state.playW / 2;
	for (let y = state.playY + 10; y < state.playY + state.playH - 10; y += 20) {
		ctx.rect(midX - 2.5, y, 10, 10);
	}
	ctx.fill();

	ctx.fillStyle = "white";
	ctx.font = "150px 'vt323'";
	ctx.textAlign = "center";
	
	const cx = state.playX + state.playW / 2;
	const y = state.playY + 120;

	ctx.fillText(String(state.scoreLeft), cx - 120, y);
	ctx.fillText(String(state.scoreRight), cx + 120, y);


	const r = 10;
	ctx.beginPath();
	ctx.arc(state.ballX, state.ballY, r, 0, Math.PI * 2);
	ctx.fill();

	const paddleW = 10;
	const paddleH = 150;
	const margin = 10;

	ctx.fillStyle = "white";
	ctx.fillRect(state.playX + margin, state.playY + state.paddleLeftY, paddleW, paddleH);
	ctx.fillRect(state.playX + state.playW - margin - paddleW, state.playY + state.paddleRightY, paddleW, paddleH);

	if (state.phase === "LOBBY") {
		ctx.fillStyle = "white";
		ctx.font = "120px 'VT323'";
		ctx.textAlign = "center";
		ctx.fillText("COCO_PONG", canvas.width / 2, state.playY - 20);
	}



	// ctx.clearRect(0, 0, canvas.width, canvas.height);

	// // fond
	// ctx.fillStyle = "black";
	// ctx.fillRect(0, 0, canvas.width, canvas.height);

	// // playfield
	// ctx.strokeStyle = "white";
	// ctx.lineWidth = 2;
	// ctx.strokeRect(s.playX, s.playY, s.playW, s.playH);

	// // console.log(`x = ${s.playX}, y = ${s.playY}, h = ${s.playH}, w = ${s.playW}`);

	// // scores
	// ctx.fillStyle = "white";
	// ctx.font = "120px 'VT323'";
	// ctx.textAlign = "center";
	// const cx = s.playX + s.playW / 2;
	// const y = s.playY + 120;
	// ctx.fillText(String(s.scoreLeft), cx - 120, y);
	// ctx.fillText(String(s.scoreRight), cx + 120, y);

	// // paddles
	// const paddleW = 10;
	// const paddleH = 150;
	// const margin = 10;

	// ctx.fillStyle = "white";
	// ctx.fillRect(s.playX + margin, s.playY + s.paddleLeftY, paddleW, paddleH);
	// ctx.fillRect(s.playX + s.playW - margin - paddleW, s.playY + s.paddleRightY, paddleW, paddleH);

	// // ball
	// const r = 10;
	// ctx.beginPath();
	// ctx.arc(s.ballX, s.ballY, r, 0, Math.PI * 2);
	// ctx.fill();

	// // overlay waiting
	// if (s.phase === "LOBBY") {
	// 	ctx.font = "90px 'VT323'";
	// 	ctx.fillText("WAITING...", cx, s.playY + s.playH / 2);
	// }
}