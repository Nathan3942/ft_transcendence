/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   events.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/13 14:47:51 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/27 12:33:22 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { number, string, stringbool } from "zod";
import { ModeId } from "../frontend/src/game/pong_core";
import { GameSlot, ModeStr } from "./plugin";

export type WsRoom =
	| `user:${string}`
  	| `game:${string}`
  	| `tournament:${string}`
  	| `global`;

export type PlayerSlot = "left" | "right";

export type PaddleInput = {
	dir: -1 | 0 | 1;
	ts: number;
};

export type WsClientEvent =
	| { type: "ping" }
	| { type: "subscribe"; room: WsRoom }
	| { type: "unsubscribe"; room: WsRoom }
	// Remote player
	| { type: "join_game"; gameId: string; clientId: string, mode: ModeId }
	| { type: "leave_game"; gameId: string }
	| { type: "input"; gameId: string; slot: PlayerSlot; input: PaddleInput };

export type GameState = {
	id: string;
	status: "waiting" | "running" | "ended";
	score: { left: number; right: number };
	ball: { x: number; y: number; vx: number; vy: number };
	paddle: {
		left: { y: number; vy: number };
		right: { y: number; vy: number };
	};
	lastTickMs: number;
};

export type WsServerEvent =
	| { type: "hello"; serverTime: number }
	| { type: "error"; code: string; message: string }
	| { type: "subscribed"; room: WsRoom }
	| { type: "unsubscribed"; room: WsRoom }

	| { type: "game_sync"; state: GameState }
	| { type: "game_tick"; state: GameState }
	| { type: "game_event"; gameId: string; event: string; payload?: unknown }
	| { type: "tournament:update"; tournamentId: string; payload: unknown }
	| { type: "match_waiting"; gameId: string; count: number, playerNeeded: number, mode: ModeStr}
	| { type: "match_ready"; gameId: string; count: number, mode: ModeStr }
	| { type: "assigned_slot"; gameId: string; slot: GameSlot }
	| { type: "match_full", gameId: string };

export type WsEnvelope<T extends { type: string }> = T;
