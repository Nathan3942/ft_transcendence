/**
 * Match Service
 * Business logic layer for match operations
 * Routes call this service, service calls repositories
 */

import {
    getAllMatches as getAllMatchesRepo,
    getMatchById as getMatchByIdRepo,
    createMatch as createMatchRepo,
    deleteMatch as deleteMatchRepo,
    getMatchesByTournament as getMatchesByTournamentRepo,
    addPlayerToMatch as addPlayerToMatchRepo,
    updateMatchPlayerScore as updateMatchPlayerScoreRepo,
    getMatchWithPlayers as getMatchWithPlayersRepo
} from '../repository/matchesRepository'
import { getTournamentById } from '../repository/tournamentsRepository'
import { getById as getUserById } from '../repository/usersRepository'
import { NotFoundError, BadRequestError } from '../utils/appErrors'
import { Match, MatchPlayer, MatchWithPlayers } from '../models/matchModel'

/**
 * Get all matches
 * @returns Array of matches
 */
export function getAllMatches(): Match[] {
    return getAllMatchesRepo()
}

/**
 * Get match by ID with players
 * @param id - Match ID
 * @returns Match with players and scores
 * @throws NotFoundError if match doesn't exist
 */
export function getMatchById(id: string | number): MatchWithPlayers {
    const match = getMatchWithPlayersRepo(id)
    if (!match) {
        throw new NotFoundError('Match not found')
    }
    return match
}

/**
 * Create a new match
 * @param tournamentId - Tournament ID
 * @param round - Round number
 * @returns Created match
 * @throws BadRequestError if data is invalid
 * @throws NotFoundError if tournament doesn't exist
 */
export function createMatch(tournamentId: number, round: number): Match {
    if (!tournamentId || tournamentId <= 0) {
        throw new BadRequestError('tournamentId must be a positive integer')
    }

    if (!round || round <= 0) {
        throw new BadRequestError('round must be a positive integer')
    }

    // Check tournament exists
    const tournament = getTournamentById(tournamentId)
    if (!tournament) {
        throw new NotFoundError('Tournament not found')
    }

    const match = createMatchRepo({ tournamentId, round })
    return match
}

/**
 * Delete match by ID
 * @param id - Match ID
 * @returns Success message with deleted match ID
 * @throws NotFoundError if match doesn't exist
 */
export function deleteMatch(id: string | number): { message: string; id: number } {
    // Check match exists
    const match = getMatchByIdRepo(id)
    if (!match) {
        throw new NotFoundError('Match not found')
    }

    const result = deleteMatchRepo(id)
    if (result.changes === 0) {
        throw new NotFoundError('Match not found')
    }

    return {
        message: 'Match deleted',
        id: typeof id === 'string' ? parseInt(id) : id
    }
}

/**
 * Get all matches for a tournament
 * @param tournamentId - Tournament ID
 * @returns Array of matches
 * @throws NotFoundError if tournament doesn't exist
 */
export function getMatchesByTournament(tournamentId: string | number): Match[] {
    // Check tournament exists
    const tournament = getTournamentById(tournamentId)
    if (!tournament) {
        throw new NotFoundError('Tournament not found')
    }

    const matches = getMatchesByTournamentRepo(tournamentId)
    return matches
}

/**
 * Add a player to a match
 * @param matchId - Match ID
 * @param userId - User ID
 * @param score - Optional initial score
 * @returns Match player record
 * @throws NotFoundError if match or user doesn't exist
 * @throws BadRequestError if player is already assigned or data is invalid
 */
export function addPlayerToMatch(
    matchId: string | number,
    userId: number,
    score: number | null = null
): MatchPlayer {
    if (!userId || userId <= 0) {
        throw new BadRequestError('userId must be a positive integer')
    }

    if (score !== null && score < 0) {
        throw new BadRequestError('score must be a non-negative integer or null')
    }

    // Check match exists
    const match = getMatchByIdRepo(matchId)
    if (!match) {
        throw new NotFoundError('Match not found')
    }

    // Check user exists
    const user = getUserById(userId)
    if (!user) {
        throw new NotFoundError('User not found')
    }

    try {
        const numericMatchId = typeof matchId === 'string' ? parseInt(matchId) : matchId
        const matchPlayer = addPlayerToMatchRepo(numericMatchId, userId, score)
        return matchPlayer
    } catch (err: any) {
        if (err.message.includes('already assigned')) {
            throw new BadRequestError('Player already assigned to this match')
        }
        throw err
    }
}

/**
 * Update player score in a match
 * @param matchId - Match ID
 * @param userId - User ID
 * @param score - New score
 * @returns Updated score information
 * @throws NotFoundError if match, user, or player assignment doesn't exist
 * @throws BadRequestError if data is invalid
 */
export function updateMatchPlayerScore(
    matchId: string | number,
    userId: number,
    score: number
): { matchId: number; userId: number; score: number } {
    if (!userId || userId <= 0) {
        throw new BadRequestError('userId must be a positive integer')
    }

    if (score < 0) {
        throw new BadRequestError('score must be a non-negative integer')
    }

    // Check match exists
    const match = getMatchByIdRepo(matchId)
    if (!match) {
        throw new NotFoundError('Match not found')
    }

    // Check user exists
    const user = getUserById(userId)
    if (!user) {
        throw new NotFoundError('User not found')
    }

    const numericMatchId = typeof matchId === 'string' ? parseInt(matchId) : matchId
    const updateResult = updateMatchPlayerScoreRepo(numericMatchId, userId, score)

    if (updateResult.changes === 0) {
        throw new NotFoundError('Player not found in this match')
    }

    return {
        matchId: numericMatchId,
        userId,
        score
    }
}
