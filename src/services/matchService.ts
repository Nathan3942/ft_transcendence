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
    getMatchWithPlayers as getMatchWithPlayersRepo,
    updateMatchStatus as updateMatchStatusRepo,
    startMatch as startMatchRepo,
    finishMatch as finishMatchRepo,
    getMatchesByStatus as getMatchesByStatusRepo
} from '../repository/matchesRepository'
import { getTournamentById } from '../repository/tournamentsRepository'
import { getById as getUserById } from '../repository/usersRepository'
import { NotFoundError, BadRequestError } from '../utils/appErrors'
import { Match, MatchPlayer, MatchWithPlayers, MatchStatus } from '../models/matchModel'

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
 * @param tournamentId - Tournament ID (nullable for non-tournament matches)
 * @param round - Round number (nullable for non-tournament matches)
 * @param status - Match status (default: 'pending')
 * @returns Created match
 * @throws BadRequestError if data is invalid
 * @throws NotFoundError if tournament is specified but doesn't exist
 */
export function createMatch(
    tournamentId: number | null,
    round: number | null,
    status: MatchStatus = 'pending'
): Match {
    // Validate status
    const validStatuses: MatchStatus[] = ['pending', 'in_progress', 'finished']
    if (!validStatuses.includes(status)) {
        throw new BadRequestError('status must be one of: pending, in_progress, finished')
    }

    // If tournamentId is provided, validate it
    if (tournamentId !== null) {
        if (tournamentId <= 0) {
            throw new BadRequestError('tournamentId must be a positive integer or null')
        }

        const tournament = getTournamentById(tournamentId)
        if (!tournament) {
            throw new NotFoundError('Tournament not found')
        }
    }

    // If round is provided, validate it
    if (round !== null && round <= 0) {
        throw new BadRequestError('round must be a positive integer or null')
    }

    const match = createMatchRepo({ tournamentId, round, status })
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

/**
 * Update match status
 * @param matchId - Match ID
 * @param status - New status
 * @returns Success message
 * @throws NotFoundError if match doesn't exist
 * @throws BadRequestError if status is invalid or transition is not allowed
 */
export function updateMatchStatus(
    matchId: string | number,
    status: MatchStatus
): { message: string; matchId: number; status: MatchStatus } {
    const validStatuses: MatchStatus[] = ['pending', 'in_progress', 'finished']
    if (!validStatuses.includes(status)) {
        throw new BadRequestError('status must be one of: pending, in_progress, finished')
    }

    const match = getMatchByIdRepo(matchId)
    if (!match) {
        throw new NotFoundError('Match not found')
    }

    // Validate status transitions
    if (match.status === 'finished') {
        throw new BadRequestError('Cannot change status of a finished match')
    }

    const numericMatchId = typeof matchId === 'string' ? parseInt(matchId) : matchId
    const updateResult = updateMatchStatusRepo(numericMatchId, status)

    if (updateResult.changes === 0) {
        throw new NotFoundError('Match not found')
    }

    return {
        message: 'Match status updated',
        matchId: numericMatchId,
        status
    }
}

/**
 * Start a match (sets status to in_progress and records start time)
 * @param matchId - Match ID
 * @returns Updated match information
 * @throws NotFoundError if match doesn't exist
 * @throws BadRequestError if match is not in pending status
 */
export function startMatch(
    matchId: string | number
): { message: string; matchId: number; status: MatchStatus } {
    const match = getMatchByIdRepo(matchId)
    if (!match) {
        throw new NotFoundError('Match not found')
    }

    if (match.status !== 'pending') {
        throw new BadRequestError('Only pending matches can be started')
    }

    const numericMatchId = typeof matchId === 'string' ? parseInt(matchId) : matchId
    const updateResult = startMatchRepo(numericMatchId)

    if (updateResult.changes === 0) {
        throw new NotFoundError('Match not found')
    }

    return {
        message: 'Match started',
        matchId: numericMatchId,
        status: 'in_progress'
    }
}

/**
 * Finish a match (sets status to finished and records end time and winner)
 * @param matchId - Match ID
 * @param winnerId - Winner user ID (nullable for draws)
 * @returns Updated match information
 * @throws NotFoundError if match or winner doesn't exist
 * @throws BadRequestError if match is not in progress or winner is invalid
 */
export function finishMatch(
    matchId: string | number,
    winnerId: number | null
): { message: string; matchId: number; status: MatchStatus; winnerId: number | null } {
    const match = getMatchByIdRepo(matchId)
    if (!match) {
        throw new NotFoundError('Match not found')
    }

    if (match.status !== 'in_progress') {
        throw new BadRequestError('Only in-progress matches can be finished')
    }

    // If winnerId is provided, validate it
    if (winnerId !== null) {
        if (winnerId <= 0) {
            throw new BadRequestError('winnerId must be a positive integer or null')
        }

        const winner = getUserById(winnerId)
        if (!winner) {
            throw new NotFoundError('Winner user not found')
        }

        // Verify winner is a player in this match
        const matchWithPlayers = getMatchWithPlayersRepo(matchId)
        const isPlayerInMatch = matchWithPlayers?.players.some(p => p.userId === winnerId)
        if (!isPlayerInMatch) {
            throw new BadRequestError('Winner must be a player in this match')
        }
    }

    const numericMatchId = typeof matchId === 'string' ? parseInt(matchId) : matchId
    const updateResult = finishMatchRepo(numericMatchId, winnerId)

    if (updateResult.changes === 0) {
        throw new NotFoundError('Match not found')
    }

    return {
        message: 'Match finished',
        matchId: numericMatchId,
        status: 'finished',
        winnerId
    }
}

/**
 * Get matches by status
 * @param status - Match status
 * @returns Array of matches with the specified status
 * @throws BadRequestError if status is invalid
 */
export function getMatchesByStatus(status: MatchStatus): Match[] {
    const validStatuses: MatchStatus[] = ['pending', 'in_progress', 'finished']
    if (!validStatuses.includes(status)) {
        throw new BadRequestError('status must be one of: pending, in_progress, finished')
    }

    const matches = getMatchesByStatusRepo(status)
    return matches
}
