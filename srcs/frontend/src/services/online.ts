/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   online.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 16:53:19 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/01 18:43:11 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { boolean, success } from "zod";
import { api } from "./api.js";
// import { getTournamentById } from "../../../repository/tournamentsRepository";

export type TournamentStatus = 'open' | 'in_progress' | 'finished';

export interface Tournament {
  id: number;
  name: string;
  status: TournamentStatus;
  winnerId: number | null;
  createdAt: string;
}

const API_BASE = `http://${window.location.hostname}:3000/api/v1`;  //a changer selon setup

// export type MatchListItem = {
//     id: string;
//     status: "waiting" | "running" | "ended";
//     createdAt?: number;
// }

export type Match = {
    id: string;
    tournamentId: number | null;
    round: number | null;
    status: "pending" | "in_progress" | "finished";
    mode: "1v1" | "2v2" | "3P" | "4P";
    createdAt?: number;
}

// async function api<T>(path: string, opts?: RequestInit): Promise<T> {

//     const res = await fetch(`${API_BASE}${path}`, {
//         headers: { "Content-Type": "application/json" },
//         ...opts, 
//     });
//     if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         throw new Error(`API error ${res.status}: ${text || res.statusText}`);
//     }
//     return (res.json() as Promise<T>);
// }


// CREATE TABLE tournaments (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL UNIQUE,
//       status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'finished')),
//       winner_id INTEGER,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (winner_id) REFERENCES users(id)
//     );

export async function createOnlineMatch(mode: 1 | 2 | 3 | 4): Promise<Match> {
    
    const modeMap: Record<1 | 2 | 3 | 4, "1v1" | "2v2" | "3p" | "4p"> = {
        1: "1v1",
        2: "2v2",
        3: "3p",
        4: "4p",
    };

    const res = await api<{ success: boolean; data: Match }>("/matches", {
        method: "POST",
        body: JSON.stringify({
        tournamentId: null,
        round: null,
        status: "pending",
        mode: modeMap[mode],
        }),
    });

    return res.data;
}

export async function startOnlineMatch(matchId: string): Promise<Match> {
    
	const res = await api<{ success: boolean; data: Match }>(
        `/matches/${matchId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({ status: "in_progress" }),
        }
    );

    return res.data;
}


export async function createOnlineTournament(): Promise<Tournament> {
	const res = await api<{ success: boolean; data: Tournament }>("/tournaments", {
		method: "POST",
		body: JSON.stringify({ name: `tournament:${Date.now()}` }),
	});

	return res.data;
}

export async function deleteMatch(id: string | number): Promise<unknown> {
    return api(`/matches/${id}`, { method: "DELETE" });
}


export async function deleteTournament(id: string | number): Promise<unknown> {
    return api(`/tournaments/${id}`, { method: "DELETE" });
}

// export async function browseGames() {
//     window.location.hash = `#/games`;
// }



export async function listOnlineMatches(): Promise<Match[]> {
    const res = await api<{ success: boolean; data: Match[] }>("/matches", { method: "GET" });
    return res.data;
}

export async function listOnlineTournament(): Promise<Tournament[]> {
    const res = await api<{ success: boolean; data: Tournament[]}>("/tournaments", { method: "GET" });
    return res.data;
}
