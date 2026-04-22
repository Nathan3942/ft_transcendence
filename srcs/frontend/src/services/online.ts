/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   online.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 16:53:19 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/17 12:05:45 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// import { boolean, success } from "zod";
import { api } from "./api.js";

export type TournamentStatus = 'open' | 'in_progress' | 'finished';
export type MatchStatus = "pending" | "in_progress" | "finished";

export interface Tournament {
  id: number;
  name: string;
  status: TournamentStatus;
  winnerId: number | null;
  createdAt: string;
}

export type Match = {
    id: string;
    tournamentId: number | null;
    round: number | null;
    status: "pending" | "in_progress" | "finished";
    mode: "1v1" | "2v2" | "3P" | "4P";
    createdAt?: number;
}

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

export async function updateMatchStatus(matchId: string, status: MatchStatus): Promise<Match> {
    
    const res = await api<{ success: boolean; data: Match }>(`/matches/${matchId}/status`, { method: "PATCH", body: JSON.stringify({ status }), });
    
    return res.data;
}

export type UpdateTournamentStatusResponse = {
	message: string;
	tournamentId: number;
	status: TournamentStatus;
};

export async function updateTournamentStatus(tournamentId: number, status: TournamentStatus): Promise<UpdateTournamentStatusResponse> {
	return api<UpdateTournamentStatusResponse>(`/tournaments/${tournamentId}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status }),
	});
}

export async function deleteMatch(id: string | number): Promise<unknown> {
    return api(`/matches/${id}`, { method: "DELETE" });
}


export async function deleteTournament(id: string | number): Promise<unknown> {
    return api(`/tournaments/${id}`, { method: "DELETE" });
}


export async function listOnlineMatches(): Promise<Match[]> {
    const res = await api<{ success: boolean; data: Match[] }>("/matches", { method: "GET" });
    return res.data;
}

export async function listOnlineTournament(): Promise<Tournament[]> {
    const res = await api<{ success: boolean; data: Tournament[]}>("/tournaments", { method: "GET" });
    return res.data;
}
