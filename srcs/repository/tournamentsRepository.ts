/* centralise toutes les requetes a la database qui concernent les tournois */

import { queryAll, queryOne, queryExecute } from '../database/queryWrapper'
import { Tournament, TournamentPlayer, TournamentWithPlayers, TournamentStatus } from '../models/tournamentModel'


export function getAllTournaments(): Tournament[] {
    return queryAll('SELECT id, name, status, winner_id as winnerId, created_at as createdAt FROM tournaments')
}


export function getTournamentById(id: string | number): Tournament | null {
    return queryOne('SELECT id, name, status, winner_id as winnerId, created_at as createdAt FROM tournaments WHERE id = ?', [id]) ?? null
}


export function createTournament({ name, status = 'open' }: { name: string; status?: TournamentStatus }): Tournament {
    try {
        const result = queryExecute(
            'INSERT INTO tournaments (name, status) VALUES (?, ?)',
            [name, status]
        );
        return {
            id: result.lastInsertRowid as number,
            name,
            status,
            winnerId: null,
            createdAt: new Date().toISOString()
        };
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error('Tournament with this name already exists');
        }
        throw err;
    }
}


export function deleteTournament(id: string | number) {
    
    // queryExecute(`DELETE FROM match_players WHERE match_id IN (SELECT id FROM matches WHERE tournament_id = ?)`, [id]);
    queryExecute(`DELETE FROM tournament_players WHERE id = ?`, [id]);

    queryExecute(`DELETE FROM matches WHERE tournament_id = ?`, [id]);

    return queryExecute('DELETE FROM tournaments WHERE id = ?', [id]);
}


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


export function getTournamentPlayers(tournamentId: string | number) {
    return queryAll(
        'SELECT id, tournament_id as tournamentId, user_id as userId, joined_at as joinedAt FROM tournament_players WHERE tournament_id = ?',
        [tournamentId]
    )
}

export function updateTournamentStatusRepo(tournamentId: number, status: TournamentStatus) {
    return queryExecute(
        'UPDATE tournaments SET status = ? WHERE id = ?',
        [status, tournamentId]
    )
}


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


export function createFinishedTournament(
    name: string,
    winnerId: number
): Tournament {
    const result = queryExecute(
        'INSERT INTO tournaments (name, status, winner_id) VALUES (?, ?, ?)',
        [name, 'finished', winnerId]
    )
    return {
        id: result.lastInsertRowid as number,
        name,
        status: 'finished',
        winnerId,
        createdAt: new Date().toISOString()
    }
}
