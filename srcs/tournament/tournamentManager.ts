/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tournamentManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/09 16:26:29 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/08 11:35:26 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { addPlayerToMatch, createMatch } from "../repository/matchesRepository";
import { getTournamentStatus, updateTournamentStatus } from "../services/tournamentService";

type TournamentPlayer = {
	clientId: string;
	userId?: number;
	username?: string;
};

type MatchNode = {
	id: number;
	matchId: number | null;
	player1: string | null;
	player2: string | null;
	player1Id: number | null;
	player2Id: number | null;
	player1ClientId: string | null;
	player2ClientId: string | null;
	winner: string | null;
	winnername: string | null;
	status: "pending" | "finished";
};

type TournamentState = {
	players: TournamentPlayer[];
	bracket?: {
		quarterFinals: MatchNode[];
		semiFinals: MatchNode[];
		final: MatchNode[];
	};
};

function shuffleArray<T>(arr: T[]): T[] {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

export class TournamentMaganer {

	private tournaments = new Map<string, TournamentState>();

	private getOrCreateTournament(tournamentId: string): TournamentState {
		let t = this.tournaments.get(tournamentId);
		if (!t) {
			t = { players: [] };
			this.tournaments.set(tournamentId, t);
		}
		return t;
	}

	// =========================
	// PLAYER MANAGEMENT
	// =========================

	registerTournamentPlayer(
		tournamentId: string,
		clientId: string,
		userId?: number,
		username?: string
	) {
		const t = this.getOrCreateTournament(tournamentId);

		const existing = t.players.find(p => p.clientId === clientId);

		if (existing) {
			existing.userId = userId ?? existing.userId;
			existing.username = username ?? existing.username;
			return;
		}

		t.players.push({ clientId, userId, username });
	}

	isTournamentPlayer(tournamentId: string, clientId: string): boolean {
		return this.tournaments.get(tournamentId)?.players.some(p => p.clientId === clientId) ?? false;
	}

	countTournamentPlayers(tournamentId: string): number {
		return this.tournaments.get(tournamentId)?.players.length ?? 0;
	}

	// =========================
	// TOURNAMENT START
	// =========================

	startTournament(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t || t.players.length !== 8) return null;

		const shuffled = shuffleArray(t.players);

		const matches = [0, 1, 2, 3].map(() =>
			createMatch({
				tournamentId: Number(tournamentId),
				round: 1,
				status: "pending",
				mode: "1v1",
			})
		);

		const quarterFinals: MatchNode[] = [];

		for (let i = 0; i < 4; i++) {
			const p1 = shuffled[i * 2];
			const p2 = shuffled[i * 2 + 1];
			const match = matches[i];

			// DB insert safe
			if (typeof p1.userId === "number")
				addPlayerToMatch(match.id, p1.userId, 0);

			if (typeof p2.userId === "number")
				addPlayerToMatch(match.id, p2.userId, 0);

			quarterFinals.push({
				id: i + 1,
				matchId: match.id,
				player1: p1.username ?? `Player ${i * 2}`,
				player2: p2.username ?? `Player ${i * 2 + 1}`,
				player1Id: p1.userId ?? null,
				player2Id: p2.userId ?? null,
				player1ClientId: p1.clientId,
				player2ClientId: p2.clientId,
				winner: null,
				winnername: null,
				status: "pending",
			});
		}

		const bracket = {
			quarterFinals,
			semiFinals: [this.emptyMatch(5), this.emptyMatch(6)],
			final: [this.emptyMatch(7)],
		};

		t.bracket = bracket;
		return bracket;
	}

	private emptyMatch(id: number): MatchNode {
		return {
			id,
			matchId: null,
			player1: null,
			player2: null,
			player1Id: null,
			player2Id: null,
			player1ClientId: null,
			player2ClientId: null,
			winner: null,
			winnername: null,
			status: "pending",
		};
	}

	// =========================
	// PROGRESSION
	// =========================

	private createNextMatch(
		tournamentId: string,
		p1: MatchNode,
		p2: MatchNode,
		round: number
	): MatchNode {

		console.log(`tournament id check: ${tournamentId}\n\n\n`);
		const match = createMatch({
			tournamentId: Number(tournamentId),
			round,
			status: "pending",
			mode: "1v1",
		});

		if (p1.player1Id)
			addPlayerToMatch(match.id, p1.player1Id, 0);
		if (p2.player1Id)
			addPlayerToMatch(match.id, p2.player1Id, 0);

		return {
			id: 0,
			matchId: match.id,
			player1: p1.winner,
			player2: p2.winner,
			player1Id: p1.player1Id,
			player2Id: p2.player1Id,
			player1ClientId: p1.player1ClientId,
			player2ClientId: p2.player1ClientId,
			winner: null,
			winnername: null,
			status: "pending",
		};
	}

	private tryAdvance(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket) return;

		const { quarterFinals, semiFinals, final } = t.bracket;

		// Semi finals
		if (quarterFinals[0].winner && quarterFinals[1].winner && !semiFinals[0].matchId) {
			semiFinals[0] = this.createNextMatch(tournamentId, quarterFinals[0], quarterFinals[1], 2);
		}

		if (quarterFinals[2].winner && quarterFinals[3].winner && !semiFinals[1].matchId) {
			semiFinals[1] = this.createNextMatch(tournamentId, quarterFinals[2], quarterFinals[3], 2);
		}

		// Final
		if (semiFinals[0].winner && semiFinals[1].winner && !final[0].matchId) {
			final[0] = this.createNextMatch(tournamentId, semiFinals[0], semiFinals[1], 3);
		}
	}

	// =========================
	// RESULT HANDLING
	// =========================

	handleMatchFinished(tournamentId: string, matchId: number, winnerUserId: number) {
		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket) return null;

		const all = [
			...t.bracket.quarterFinals,
			...t.bracket.semiFinals,
			...t.bracket.final,
		];

		const match = all.find(m => m.matchId === matchId);
		if (!match) return t.bracket;

		match.status = "finished";

		console.log(`winner id ${winnerUserId}`);

		if (match.player1Id === winnerUserId)
			match.winner = match.player1;
		else if (match.player2Id === winnerUserId)
			match.winner = match.player2;
		else
			match.winner = `User #${winnerUserId}`;

		this.tryAdvance(tournamentId);
		this.tryFinishTournament(tournamentId);

		return t.bracket;
	}

	tryFinishTournament(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket) return null;

		const final = t.bracket.final[0];

		if (final.winner && final.status === "finished") {
			if (getTournamentStatus(tournamentId) !== "finished") {
				updateTournamentStatus(Number(tournamentId), "finished");
			}

			return {
				winnerName: final.winner,
				winnerId: final.player1 === final.winner ? final.player1Id : final.player2Id
			};
		}

		return null;
	}

	getBracket(tournamentId: string) {
		return this.tournaments.get(tournamentId)?.bracket ?? null;
	}
}