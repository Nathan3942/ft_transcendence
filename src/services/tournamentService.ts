/**
 * Tournament Service
 * Business logic layer for tournament operations
 * Routes call this service, service calls repositories
 */

import {
    getAllTournaments as getAllTournamentsRepo,
    getTournamentById as getTournamentByIdRepo,
    createTournament as createTournamentRepo,
    deleteTournament as deleteTournamentRepo,
    addPlayerToTournament as addPlayerToTournamentRepo,
    getTournamentPlayers as getTournamentPlayersRepo,
    getTournamentWithPlayers as getTournamentWithPlayersRepo
} from '../repository/tournamentsRepository'
import { getById as getUserById } from '../repository/usersRepository'
import { NotFoundError, BadRequestError } from '../utils/appErrors'
import { Tournament, TournamentPlayer, TournamentWithPlayers } from '../models/tournamentModel'

/**
 * Get all tournaments
 * @returns Array of tournaments
 */
export function getAllTournaments(): Tournament[] {
    return getAllTournamentsRepo()
}

/**
 * Get tournament by ID with players
 * @param id - Tournament ID
 * @returns Tournament with players
 * @throws NotFoundError if tournament doesn't exist
 */
export function getTournamentById(id: string | number): TournamentWithPlayers {
    const tournament = getTournamentWithPlayersRepo(id)
    if (!tournament) {
        throw new NotFoundError('Tournament not found')
    }
    return tournament
}

/**
 * Create a new tournament
 * @param name - Tournament name
 * @returns Created tournament
 * @throws BadRequestError if name is invalid or tournament already exists
 */
export function createTournament(name: string): Tournament {
    if (!name || name.trim().length === 0) {
        throw new BadRequestError('Tournament name is required')
    }

    try {
        const tournament = createTournamentRepo({ name: name.trim() })
        return tournament
    } catch (err: any) {
        if (err.message.includes('already exists')) {
            throw new BadRequestError('Tournament with this name already exists')
        }
        throw err
    }
}

/**
 * Delete tournament by ID
 * @param id - Tournament ID
 * @returns Success message with deleted tournament ID
 * @throws NotFoundError if tournament doesn't exist
 */
export function deleteTournament(id: string | number): { message: string; id: number } {
    // Check tournament exists
    const tournament = getTournamentByIdRepo(id)
    if (!tournament) {
        throw new NotFoundError('Tournament not found')
    }

    const result = deleteTournamentRepo(id)
    if (result.changes === 0) {
        throw new NotFoundError('Tournament not found')
    }

    return {
        message: 'Tournament deleted',
        id: typeof id === 'string' ? parseInt(id) : id
    }
}

/**
 * Add a player to a tournament
 * @param tournamentId - Tournament ID
 * @param userId - User ID
 * @returns Tournament player record
 * @throws NotFoundError if tournament or user doesn't exist
 * @throws BadRequestError if player is already registered or userId is invalid
 */
export function addPlayerToTournament(tournamentId: string | number, userId: number): TournamentPlayer {
    if (!userId || userId <= 0) {
        throw new BadRequestError('userId must be a positive integer')
    }

    // Check tournament exists
    const tournament = getTournamentByIdRepo(tournamentId)
    if (!tournament) {
        throw new NotFoundError('Tournament not found')
    }

    // Check user exists
    const user = getUserById(userId)
    if (!user) {
        throw new NotFoundError('User not found')
    }

    try {
        const numericTournamentId = typeof tournamentId === 'string' ? parseInt(tournamentId) : tournamentId
        const tournamentPlayer = addPlayerToTournamentRepo(numericTournamentId, userId)
        return tournamentPlayer
    } catch (err: any) {
        if (err.message.includes('already registered')) {
            throw new BadRequestError('Player already registered for this tournament')
        }
        throw err
    }
}

/**
 * Get all players in a tournament
 * @param tournamentId - Tournament ID
 * @returns Array of tournament players
 * @throws NotFoundError if tournament doesn't exist
 */
export function getTournamentPlayers(tournamentId: string | number): any[] {
    // Check tournament exists
    const tournament = getTournamentByIdRepo(tournamentId)
    if (!tournament) {
        throw new NotFoundError('Tournament not found')
    }

    const players = getTournamentPlayersRepo(tournamentId)
    return players
}
