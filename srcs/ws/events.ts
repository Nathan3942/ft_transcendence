/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   events.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/13 14:47:51 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/17 17:56:29 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type WsRoom = 
	| `user:${string}`
	| `game:${string}`
	| `tournament:${string}`
	| `global`;


export type WsClientEvent = 
	| { type: "ping" }
	| { type: "subscribe"; room: WsRoom }
	| { type: "unsubscribe"; room: WsRoom };


export type WsServerEvent =
	| { type: "hello"; serverTime: number }
	| { type: "error"; code: string; message: string }
	| { type: "subscribed"; room: WsRoom }
	| { type: "unsubscribed"; room: WsRoom }
	| { type: "tournament:update"; tournamentId: string; payload: unknown };
	

export type WsEnvelope<T extends { type: string }> = T & {
	
};
