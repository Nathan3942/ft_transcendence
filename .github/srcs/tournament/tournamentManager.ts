/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tournamentManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/09 16:26:29 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/13 16:33:06 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { number } from "zod";
import { addPlayerToMatch, createMatch } from "../repository/matchesRepository";
import { getTournamentStatus, updateTournamentStatus } from "../services/tournamentService";

type TournamentPlayer = {
	clientId: string;
	userId?: string;
}

type TournamentState = {
	players: TournamentPlayer[];
	bracket?: any;
}

function shuffleArray<T>(arr: T[]): T[] {

	const copy = [...arr];
	
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}

	return copy;
}

// function getWinnerInfo(match: any) {
// 	if (!match?.winner)
// 		return null;

// 	if (match.winner === match.player1) {
// 		return {
// 			name: match.player1,
// 			userId: match.player1Id ?? null,
// 			clientId: match.player1ClientId ?? null,
// 		};
// 	}

// 	if (match.winner === match.player2) {
// 		return {
// 			name: match.player2,
// 			userId: match.player2Id ?? null,
// 			clientId: match.player2ClientId ?? null,
// 		};
// 	}

// 	return null;
// }

export class TournamentMaganer {

	private tournaments = new Map<string, TournamentState>();

	private getOrCreateTrounament(tournamentId: string): TournamentState {
		
		let t = this.tournaments.get(tournamentId);
		if (!t) {
			t = { players: [] };
			this.tournaments.set(tournamentId, t);
		}
		return t;
	}

	

	registerTournamentPlayer(tournamentId: string, clientId: string, userId?: string) {
		
		const t = this.getOrCreateTrounament(tournamentId);

		const alreadyExiste = t.players.some((p) => p.clientId === clientId);
		if (alreadyExiste)
			return;
		t.players.push({ clientId, userId });
		// addPlayerToTournament(tournamentId, clientId);
	}

	isTournamentPlayer(tournamentId: string, clientId: string): boolean {
		
		const t = this.tournaments.get(tournamentId);

		if (!t)
			return false;

		return t.players.some((p) => p.clientId === clientId);
	}

	countTournamentPlayers(tournamentId: string): number {
		const t = this.tournaments.get(tournamentId);
		if (!t)
			return 0;
		return t.players.length;
	}

	getTournamentPlayers(tournamentId: string): TournamentPlayer[] {
		
		const t = this.tournaments.get(tournamentId);
		if (!t)
			return [];
		return t.players;
	}

	startTournament(tournamentId: string) {

		const t = this.tournaments.get(tournamentId);
		if (!t)
			return null;

		if (t.players.length !== 8)
			return null;

		const shuffled = shuffleArray(t.players);

		const m1 = createMatch({
			tournamentId: Number(tournamentId),
			round: 1,
			status: "pending",
			mode: "1v1",
		});

		const m2 = createMatch({
			tournamentId: Number(tournamentId),
			round: 1,
			status: "pending",
			mode: "1v1",
		});

		const m3 = createMatch({
			tournamentId: Number(tournamentId),
			round: 1,
			status: "pending",
			mode: "1v1",
		});

		const m4 = createMatch({
			tournamentId: Number(tournamentId),
			round: 1,
			status: "pending",
			mode: "1v1",
		});

		if (shuffled[0].userId && shuffled[1].userId) {
			addPlayerToMatch(m1.id, Number(shuffled[0].userId), 0);
			addPlayerToMatch(m1.id, Number(shuffled[1].userId), 0);
		}

		if (shuffled[2].userId && shuffled[3].userId) {
			addPlayerToMatch(m1.id, Number(shuffled[2].userId), 0);
			addPlayerToMatch(m1.id, Number(shuffled[3].userId), 0);
		}

		if (shuffled[4].userId && shuffled[5].userId) {
			addPlayerToMatch(m1.id, Number(shuffled[4].userId), 0);
			addPlayerToMatch(m1.id, Number(shuffled[5].userId), 0);
		}

		if (shuffled[6].userId && shuffled[7].userId) {
			addPlayerToMatch(m1.id, Number(shuffled[6].userId), 0);
			addPlayerToMatch(m1.id, Number(shuffled[7].userId), 0);
		}

		const bracket = {
			quarterFinals: [
				{
					id: 1,
					matchId: m1.id,
					player1: shuffled[0].clientId,
					player2: shuffled[1].clientId,
					player1Id: shuffled[0].userId ?? null,
					player2Id: shuffled[1].userId ?? null,
					player1ClientId: shuffled[0].clientId,
					player2ClientId: shuffled[1].clientId,
					winner: null,
					status: "pending",
				},
				{
					id: 2,
					matchId: m2.id,
					player1: shuffled[2].clientId,
					player2: shuffled[3].clientId,
					player1Id: shuffled[2].userId ?? null,
					player2Id: shuffled[3].userId ?? null,
					player1ClientId: shuffled[2].clientId,
					player2ClientId: shuffled[3].clientId,
					winner: null,
					status: "pending",
				},
				{
					id: 3,
					matchId: m3.id,
					player1: shuffled[4].clientId,
					player2: shuffled[5].clientId,
					player1Id: shuffled[4].userId ?? null,
					player2Id: shuffled[5].userId ?? null,
					player1ClientId: shuffled[4].clientId,
					player2ClientId: shuffled[5].clientId,
					winner: null,
					status: "pending",
				},
				{
					id: 4,
					matchId: m4.id,
					player1: shuffled[6].clientId,
					player2: shuffled[7].clientId,
					player1Id: shuffled[6].userId ?? null,
					player2Id: shuffled[7].userId ?? null,
					player1ClientId: shuffled[6].clientId,
					player2ClientId: shuffled[7].clientId,
					winner: null,
					status: "pending",
				},
				],
				semiFinals: [
					{
						id: 5,
						matchId: null,
						player1: null,
						player2: null,
						player1Id: null,
						player2Id: null,
						player1ClientId: null,
						player2ClientId: null,
						winner: null,
						status: "pending",
					},
					{
						id: 6,
						matchId: null,
						player1: null,
						player2: null,
						player1Id: null,
						player2Id: null,
						player1ClientId: null,
						player2ClientId: null,
						winner: null,
						status: "pending",
					},
				],
		final: [
				{
					id: 7,
					matchId: null,
					player1: null,
					player2: null,
					player1Id: null,
					player2Id: null,
					player1ClientId: null,
					player2ClientId: null,
					winner: null,
					status: "pending",
				},
			],
		};

		t.bracket = bracket;
		return bracket;
	}

	private tryAdvanceToSemiFinals(tournamentId: string) {

		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket)
			return;

		const qf = t.bracket.quarterFinals;
		const sf = t.bracket.semiFinals;

		if (qf[0].winner && qf[1].winner && !sf[0].matchId) {
			const match = createMatch({
				tournamentId: Number(tournamentId),
				round: 2,
				status: "pending",
				mode: "1v1",
			});

			sf[0].matchId = match.id;
			sf[0].player1 = qf[0].winner;
			sf[0].player2 = qf[1].winner;
			sf[0].player1Id = qf[0].player1 === qf[0].winner ? qf[0].player1Id : qf[0].player2Id;
			sf[0].player2Id = qf[1].player1 === qf[1].winner ? qf[1].player1Id : qf[1].player2Id;
			sf[0].player1ClientId = qf[0].player1 === qf[0].winner ? qf[0].player1ClientId : qf[0].player2ClientId;
			sf[0].player2ClientId = qf[1].player1 === qf[1].winner ? qf[1].player1ClientId : qf[1].player2ClientId;
			sf[0].status = "pending";

			if (sf[0].player1Id)
				addPlayerToMatch(match.id, Number(sf[0].player1Id), 0);
			if (sf[0].player2Id)
				addPlayerToMatch(match.id, Number(sf[0].player2Id), 0);
		}

		if (qf[2].winner && qf[3].winner && !sf[1].matchId) {
			const match = createMatch({
				tournamentId: Number(tournamentId),
				round: 2,
				status: "pending",
				mode: "1v1",
			});

			sf[1].matchId = match.id;
			sf[1].player1 = qf[2].winner;
			sf[1].player2 = qf[3].winner;
			sf[1].player1Id = qf[2].player1 === qf[2].winner ? qf[2].player1Id : qf[2].player2Id;
			sf[1].player2Id = qf[3].player1 === qf[3].winner ? qf[3].player1Id : qf[3].player2Id;
			sf[1].player1ClientId = qf[2].player1 === qf[2].winner ? qf[2].player1ClientId : qf[2].player2ClientId;
			sf[1].player2ClientId = qf[3].player1 === qf[3].winner ? qf[3].player1ClientId : qf[3].player2ClientId;
			sf[1].status = "pending";

			if (sf[1].player1Id)
				addPlayerToMatch(match.id, Number(sf[1].player1Id), 0);
			if (sf[1].player2Id)
				addPlayerToMatch(match.id, Number(sf[1].player2Id), 0);
		}
	}

	private tryAdvanceToFinal(tournamentId: string) {

		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket)
			return;

		const sf = t.bracket.semiFinals;
		const f = t.bracket.final;

		if (sf[0].winner && sf[1].winner && !f[0].matchId) {
			const match = createMatch({
				tournamentId: Number(tournamentId),
				round: 2,
				status: "pending",
				mode: "1v1",
			});

			f[0].matchId = match.id;
			f[0].player1 = sf[0].winner;
			f[0].player2 = sf[1].winner;
			f[0].player1Id = sf[0].player1 === sf[0].winner ? sf[0].player1Id : sf[0].player2Id;
			f[0].player2Id = sf[1].player1 === sf[1].winner ? sf[1].player1Id : sf[1].player2Id;
			f[0].player1ClientId = sf[0].player1 === sf[0].winner ? sf[0].player1ClientId : sf[0].player2ClientId;
			f[0].player2ClientId = sf[1].player1 === sf[1].winner ? sf[1].player1ClientId : sf[1].player2ClientId;
			f[0].status = "pending";

			if (f[0].player1Id)
				addPlayerToMatch(match.id, Number(f[0].player1Id), 0);
			if (f[0].player2Id)
				addPlayerToMatch(match.id, Number(f[0].player2Id), 0);
		}
	}

	tryFinishTournament(tournamentId: string) {
		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket)
			return null;

		const final = t.bracket.final ?? [];

		if (final.length === 0)
			return null;

		const finalMatch = final[0];

		if (finalMatch.winner && finalMatch.status === "finished") {

			const winnerName = finalMatch.winner;
			const winnerId = finalMatch.player1 === winnerName
				? finalMatch.player1Id
				: finalMatch.player2Id;

			
			if (getTournamentStatus(tournamentId) !== "finished")
				updateTournamentStatus(Number(tournamentId), "finished");

			// if (winnerId)
			// 	setTournamentWinner(Number(tournamentId), Number(winnerId));

			return {
				winnerName,
				winnerId
			};
		}

		return null;
	}

	handleMatchFinished(tournamentId: string, matchId: number, winnerUserId: number) {
		const t = this.tournaments.get(tournamentId);
		if (!t?.bracket)
			return null;

		const bracket = t.bracket;

		const allRounds = [
			bracket.quarterFinals ?? [],
			bracket.semiFinals ?? [],
			bracket.final ?? [],
		];

		let finishedMatch: any = null;

		for (const round of allRounds) {
			for (const match of round) {
				if (match.matchId === matchId) {
					match.status = "finished";

					if (match.player1ClientId === winnerUserId)
						match.winner = match.player1;
					else if (match.player2ClientId === winnerUserId)
						match.winner = match.player2;
					else
						match.winner = `User #${winnerUserId}`;

					finishedMatch = match;
					break;
				}
			}
			if (finishedMatch) break;
		}

		if (!finishedMatch)
			return bracket;

		// ---- Si quart de finale terminé -> remplir demi
		this.tryAdvanceToSemiFinals(tournamentId);

		// ---- Si demi terminée -> remplir finale
		this.tryAdvanceToFinal(tournamentId);

		// // ---- Si finale terminée -> tournoi fini
		this.tryFinishTournament(tournamentId);

		return bracket;
	}

	getBracket(tournamentId: string) {
		return this.tournaments.get(tournamentId)?.bracket ?? null;
	}
}