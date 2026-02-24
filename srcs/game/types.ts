/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 15:46:01 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/24 17:41:25 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type GameId = string;
export type PlayerSlot = "left" | "right";

export type PaddleInput = {
	dir: -1 | 0 | 1; // -1 up, 0 stop, 1 down
	ts: number; // client timestamp
}

export type GameState = {
	id: GameId;
	status: "waiting" | "running" | "ended";
	score: { left: number; right: number };

	ball: { x: number; y: number; vx: number; vy: number };
	paddle: {
		left: { y: number; vy: number };
		right: { y: number; vy: number };
	};

	lastTickMs: number;
	play?: { x: number; y: number; w: number; h: number };
};