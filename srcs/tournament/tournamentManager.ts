/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tournamentManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/09 16:26:29 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/18 13:21:16 by njeanbou         ###   ########.fr       */
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

	registerTournamentPlayer(
		tournamentId: string,
		clientId: string,
		userId?: number,
		username?: string
	) {
		const t = this.getOrCreateTournament(tournamentId);

		// un joueur = un userId
		const existing = t.players.find((p) => p.userId === userId);

		if (existing) {
			existing.clientId = clientId;
			existing.username = username ?? existing.username;
			return;
		}

		t.players.push({ clientId, userId, username });
	}

	isTournamentPlayer(tournamentId: string, clientId: string): boolean {
		return this.tournaments.get(tournamentId)?.players.some((p) => p.clientId === clientId) ?? false;
	}

	countTournamentPlayers(tournamentId: string): number {
		return this.tournaments.get(tournamentId)?.players.length ?? 0;
	}

	startTournament(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t) return null;

		const uniquePlayers = Array.from(
			new Map(t.players.map((p) => [p.userId, p])).values()
		);

		if (uniquePlayers.length !== 8) {
			console.warn("Tournament needs 8 unique players, got:", uniquePlayers.length);
			return null;
		}

		const shuffled = shuffleArray(uniquePlayers);

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

			if (typeof p1.userId === "number")
				addPlayerToMatch(match.id, p1.userId, 0);

			if (typeof p2.userId === "number")
				addPlayerToMatch(match.id, p2.userId, 0);

			quarterFinals.push({
				id: i + 1,
				matchId: match.id,
				player1: p1.username ?? `Player ${i * 2 + 1}`,
				player2: p2.username ?? `Player ${i * 2 + 2}`,
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

	private createNextMatch(
		tournamentId: string,
		p1: MatchNode,
		p2: MatchNode,
		round: number
	): MatchNode {
		const match = createMatch({
			tournamentId: Number(tournamentId),
			round,
			status: "pending",
			mode: "1v1",
		});

		const p1IsPlayer1 = p1.winner === p1.player1;
		const p1ClientId = p1IsPlayer1 ? p1.player1ClientId : p1.player2ClientId;
		const p1Id = p1IsPlayer1 ? p1.player1Id : p1.player2Id;

		const p2IsPlayer1 = p2.winner === p2.player1;
		const p2ClientId = p2IsPlayer1 ? p2.player1ClientId : p2.player2ClientId;
		const p2Id = p2IsPlayer1 ? p2.player1Id : p2.player2Id;

		if (p1Id) addPlayerToMatch(match.id, p1Id, 0);
		if (p2Id) addPlayerToMatch(match.id, p2Id, 0);

		return {
			id: round === 2 ? (p1.id === 1 || p1.id === 2 ? 5 : 6) : 7,
			matchId: match.id,
			player1: p1.winner,
			player2: p2.winner,
			player1Id: p1Id,
			player2Id: p2Id,
			player1ClientId: p1ClientId,
			player2ClientId: p2ClientId,
			winner: null,
			winnername: null,
			status: "pending",
		};
	}

	private tryAdvance(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket) return;

		const { quarterFinals, semiFinals, final } = t.bracket;

		if (quarterFinals[0].winner && quarterFinals[1].winner && !semiFinals[0].matchId) {
			semiFinals[0] = this.createNextMatch(tournamentId, quarterFinals[0], quarterFinals[1], 2);
		}

		if (quarterFinals[2].winner && quarterFinals[3].winner && !semiFinals[1].matchId) {
			semiFinals[1] = this.createNextMatch(tournamentId, quarterFinals[2], quarterFinals[3], 2);
		}

		if (semiFinals[0].winner && semiFinals[1].winner && !final[0].matchId) {
			final[0] = this.createNextMatch(tournamentId, semiFinals[0], semiFinals[1], 3);
		}
	}

	handleMatchFinished(
		tournamentId: string,
		matchId: number,
		winnerUserId: number,
		winnerName?: string | null
	) {
		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket) return null;

		const all = [
			...t.bracket.quarterFinals,
			...t.bracket.semiFinals,
			...t.bracket.final,
		];

		const match = all.find((m) => m.matchId === matchId);
		if (!match) return null;

		match.status = "finished";

		if (match.player1Id === winnerUserId) {
			match.winner = match.player1;
			match.winnername = match.player1;
		} else if (match.player2Id === winnerUserId) {
			match.winner = match.player2;
			match.winnername = match.player2;
		} else {
			match.winner = winnerName ?? `User #${winnerUserId}`;
			match.winnername = match.winner;
		}

		this.tryAdvance(tournamentId);

		const final = t.bracket.final[0];

		// fin de tournoi centralisée ici, une seule fois
		if (
			final.matchId &&
			final.status === "finished" &&
			final.winner &&
			getTournamentStatus(tournamentId) !== "finished"
		) {
			updateTournamentStatus(Number(tournamentId), "finished");

			return {
				type: "tournament_finished" as const,
				bracket: t.bracket,
				winnerName: final.winnername,
				winnerId: final.player1 === final.winner ? final.player1Id : final.player2Id,
			};
		}

		return {
			type: "bracket_update" as const,
			bracket: t.bracket,
		};
	}

	getBracket(tournamentId: string) {
		return this.tournaments.get(tournamentId)?.bracket ?? null;
	}

	getWinner(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket) return null;
		return t.bracket.final[0]?.winnername ?? null;
	}

	forceCloseTournament(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t)
			return;

		if (t.bracket) {
			for (const match of [
				...t.bracket.quarterFinals,
				...t.bracket.semiFinals,
				...t.bracket.final,
			]) {
				match.status = "finished";
			}
		}
	}

	getActiveMatchIds(tournamentId: string): number[] {
		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket)
			return [];

		return [
			...t.bracket.quarterFinals,
			...t.bracket.semiFinals,
			...t.bracket.final,
		]
			.map((m) => m.matchId)
			.filter((id): id is number => typeof id === "number");
	}
}