/* Matches repository - centralizes all database operations for matches */

import { queryAll, queryOne, queryExecute } from '../database/queryWrapper'
import { Match, MatchPlayer, MatchWithPlayers } from '../models/matchModel'

// Get all matches
export function getAllMatches(): Match[] {
    return queryAll('SELECT id, tournament_id as tournamentId, round, created_at as createdAt FROM matches')
}

// Get match by ID
export function getMatchById(id: string | number): Match | null {
    return queryOne('SELECT id, tournament_id as tournamentId, round, created_at as createdAt FROM matches WHERE id = ?', [id]) ?? null
}

// Create a new match
export function createMatch({ tournamentId, round }: { tournamentId: number; round: number }): Match {
    const result = queryExecute(
        'INSERT INTO matches (tournament_id, round) VALUES (?, ?)',
        [tournamentId, round]
    );
    return {
        id: result.lastInsertRowid as number,
        tournamentId,
        round,
        createdAt: new Date().toISOString()
    };
}

// Delete a match
export function deleteMatch(id: string | number) {
    return queryExecute('DELETE FROM matches WHERE id = ?', [id])
}

// Get matches for a tournament
export function getMatchesByTournament(tournamentId: string | number): Match[] {
    return queryAll(
        'SELECT id, tournament_id as tournamentId, round, created_at as createdAt FROM matches WHERE tournament_id = ?',
        [tournamentId]
    )
}

// Add a player to a match
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

// Update player score in a match
export function updateMatchPlayerScore(matchId: number, userId: number, score: number) {
    return queryExecute(
        'UPDATE match_player SET score = ? WHERE match_id = ? AND user_id = ?',
        [score, matchId, userId]
    )
}

// Get match with players and scores
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
