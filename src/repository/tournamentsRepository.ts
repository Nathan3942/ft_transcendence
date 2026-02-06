/* Tournaments repository - centralizes all database operations for tournaments */

import { queryAll, queryOne, queryExecute } from '../database/queryWrapper'
import { Tournament, TournamentPlayer, TournamentWithPlayers } from '../models/tournamentModel'

// Get all tournaments
export function getAllTournaments(): Tournament[] {
    return queryAll('SELECT id, name, created_at as createdAt FROM tournaments')
}

// Get tournament by ID
export function getTournamentById(id: string | number): Tournament | null {
    return queryOne('SELECT id, name, created_at as createdAt FROM tournaments WHERE id = ?', [id]) ?? null
}

// Create a new tournament
export function createTournament({ name }: { name: string }): Tournament {
    try {
        const result = queryExecute(
            'INSERT INTO tournaments (name) VALUES (?)',
            [name]
        );
        return {
            id: result.lastInsertRowid as number,
            name,
            createdAt: new Date().toISOString()
        };
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error('Tournament with this name already exists');
        }
        throw err;
    }
}

// Delete a tournament
export function deleteTournament(id: string | number) {
    return queryExecute('DELETE FROM tournaments WHERE id = ?', [id])
}

// Add a player to a tournament
export function addPlayerToTournament(tournamentId: number, userId: number): TournamentPlayer {
    try {
        const result = queryExecute(
            'INSERT INTO tournament_players (tournament_id, user_id) VALUES (?, ?)',
            [tournamentId, userId]
        );
        return {
            id: result.lastInsertRowid as number,
            tournamentId,
            userId,
            joinedAt: new Date().toISOString()
        };
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error('Player already registered for this tournament');
        }
        throw err;
    }
}

// Get all players in a tournament
export function getTournamentPlayers(tournamentId: string | number) {
    return queryAll(
        'SELECT id, tournament_id as tournamentId, user_id as userId, joined_at as joinedAt FROM tournament_players WHERE tournament_id = ?',
        [tournamentId]
    )
}

// Get tournament with players
export function getTournamentWithPlayers(tournamentId: string | number): TournamentWithPlayers | null {
    const tournament = getTournamentById(tournamentId)
    if (!tournament) return null

    const players = queryAll(
        'SELECT user_id FROM tournament_players WHERE tournament_id = ?',
        [tournamentId]
    )

    return {
        ...tournament,
        players: players.map((p: any) => p.user_id)
    }
}
