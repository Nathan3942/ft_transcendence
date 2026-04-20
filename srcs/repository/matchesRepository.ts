/* centralise toutes les requetes a la database qui concernent les matchs*/

import { getDatabase } from '../database';
import { queryAll, queryOne, queryExecute } from '../database/queryWrapper'
import { Match, MatchPlayer, MatchWithPlayers, MatchStatus, ModeStatus } from '../models/matchModel'


export function getAllMatches(): Match[] {
    return queryAll(`
        SELECT
            id,
            tournament_id as tournamentId,
            round,
            status,
            mode,
            winner_id as winnerId,
            started_at as startedAt,
            finished_at as finishedAt,
            created_at as createdAt
        FROM matches
    `)
}


export function getMatchById(id: string | number): Match | null {
    return queryOne(`
        SELECT
            id,
            tournament_id as tournamentId,
            round,
            status,
            mode,
            winner_id as winnerId,
            started_at as startedAt,
            finished_at as finishedAt,
            created_at as createdAt
        FROM matches
        WHERE id = ?
    `, [id]) ?? null
}


export function createMatch({
    tournamentId,
    round,
    status = 'pending',
    mode = '1v1',
}: {
    tournamentId: number | null;
    round: number | null;
    status?: MatchStatus;
    mode?: ModeStatus;
}): Match {
    const result = queryExecute(
    'INSERT INTO matches (tournament_id, round, status, mode) VALUES (?, ?, ?, ?)',
    [tournamentId, round, status, mode]
    );
    return {
        id: result.lastInsertRowid as number,
        tournamentId,
        round,
        status,
        mode,
        winnerId: null,
        startedAt: null,
        finishedAt: null,
        createdAt: new Date().toISOString()
    };
}


export function deleteMatch(id: string | number) {

    const db = getDatabase(); // selon ton projet

    db.exec("BEGIN");

    try {
        queryExecute("DELETE FROM match_player WHERE match_id = ?", [id]);
        const result = queryExecute("DELETE FROM matches WHERE id = ?", [id]);

        db.exec("COMMIT");
        return result;
    }
    catch (err) {
        db.exec("ROLLBACK");
        throw err;
    }

    // queryExecute("DELETE FROM match_player WHERE match_id = ?", [id]);
    // return queryExecute('DELETE FROM matches WHERE id = ?', [id])
}


export function getMatchesByTournament(tournamentId: string | number): Match[] {
    return queryAll(`
        SELECT
            id,
            tournament_id as tournamentId,
            round,
            status,
            winner_id as winnerId,
            started_at as startedAt,
            finished_at as finishedAt,
            created_at as createdAt
        FROM matches
        WHERE tournament_id = ?
    `, [tournamentId])
}


export function addPlayerToMatch(matchId: number, userId: number, score: number | null = null): MatchPlayer {
    try {
        const result = queryExecute(
            'INSERT INTO match_player (match_id, user_id, score) VALUES (?, ?, ?)',
            [matchId, userId, score]
        );
        return {
            id: result.lastInsertRowid as number,
            matchId,
            userId,
            score
        };
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error('Player already assigned to this match');
        }
        throw err;
    }
}


export function updateMatchPlayerScore(matchId: number, userId: number, score: number) {
    return queryExecute(
        'UPDATE match_player SET score = ? WHERE match_id = ? AND user_id = ?',
        [score, matchId, userId]
    )
}


export function getMatchWithPlayers(matchId: string | number): MatchWithPlayers | null {
    const match = getMatchById(matchId)
    if (!match) return null

    const players = queryAll(
        'SELECT user_id as userId, score FROM match_player WHERE match_id = ?',
        [matchId]
    ) as { userId: number; score: number | null }[]

    return {
        ...match,
        players
    }
}


export function updateMatchStatus(matchId: number, status: MatchStatus) {
    return queryExecute(
        'UPDATE matches SET status = ? WHERE id = ?',
        [status, matchId]
    )
}


export function startMatch(matchId: number) {
    const now = new Date().toISOString()
    return queryExecute(
        'UPDATE matches SET status = ?, started_at = ? WHERE id = ?',
        ['in_progress', now, matchId]
    )
}


export function finishMatch(matchId: number, winnerId: number | null) {
    const now = new Date().toISOString()
    return queryExecute(
        'UPDATE matches SET status = ?, finished_at = ?, winner_id = ? WHERE id = ?',
        ['finished', now, winnerId, matchId]
    )
}


export function getMatchesByStatus(status: MatchStatus): Match[] {
    return queryAll(`
        SELECT
            id,
            tournament_id as tournamentId,
            round,
            status,
            mode,
            winner_id as winnerId,
            started_at as startedAt,
            finished_at as finishedAt,
            created_at as createdAt
        FROM matches
        WHERE status = ?
    `, [status])
}


export function createFinishedMatchWithPlayers(
    winnerId: number | null,
    player1Id: number,
    scorePlayer1: number,
    player2Id: number | null,
    scorePlayer2: number,
    mode: ModeStatus
): MatchWithPlayers {
    const now = new Date().toISOString()

    // Create match with status finished and finished_at set
    const aiScore = player2Id === null ? scorePlayer2 : null
    const matchResult = queryExecute(
        'INSERT INTO matches (tournament_id, round, status, mode, winner_id, ai_score, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [null, null, 'finished', mode, winnerId, aiScore, now]
    )

    const matchId = matchResult.lastInsertRowid as number

    // Insert player 1
    queryExecute(
        'INSERT INTO match_player (match_id, user_id, score) VALUES (?, ?, ?)',
        [matchId, player1Id, scorePlayer1]
    )

    // Insert player 2 only if not null (not AI match)
    const players: { userId: number; score: number | null }[] = [
        { userId: player1Id, score: scorePlayer1 }
    ]

    if (player2Id !== null) {
        queryExecute(
            'INSERT INTO match_player (match_id, user_id, score) VALUES (?, ?, ?)',
            [matchId, player2Id, scorePlayer2]
        )
        players.push({ userId: player2Id, score: scorePlayer2 })
    }

    return {
        id: matchId,
        tournamentId: null,
        round: null,
        status: 'finished',
        mode,
        winnerId,
        startedAt: null,
        finishedAt: now,
        createdAt: now,
        players
    }
}
