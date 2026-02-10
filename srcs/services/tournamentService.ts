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
    getTournamentWithPlayers as getTournamentWithPlayersRepo,
    createFinishedTournament as createFinishedTournamentRepo
} from '../repository/tournamentsRepository'
import { getById as getUserById, getOrCreateByUsername } from '../repository/usersRepository'
import { createFinishedMatchWithPlayers } from '../repository/matchesRepository'
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

interface TournamentMatchInput {
    player1Name: string;
    player2Name: string;
    scorePlayer1: number;
    scorePlayer2: number;
    winnerName: string;
    round: number;
}

interface TournamentResultInput {
    name: string;
    players: { name: string; isAi: boolean }[];
    matches: TournamentMatchInput[];
    championName: string;
}

/**
 * Save a completed local tournament result
 * Creates users (get-or-create), tournament, players, and all matches
 */
export function saveTournamentResult(input: TournamentResultInput) {
    const { name, players, matches, championName } = input

    if (!name || name.trim().length === 0) {
        throw new BadRequestError('Tournament name is required')
    }
    if (!players || players.length < 2) {
        throw new BadRequestError('At least 2 players are required')
    }
    if (!matches || matches.length === 0) {
        throw new BadRequestError('At least 1 match is required')
    }
    if (!championName || championName.trim().length === 0) {
        throw new BadRequestError('Champion name is required')
    }

    // Get or create all non-AI players, map names to user objects
    const userMap = new Map<string, { id: number; username: string }>()
    for (const p of players) {
        if (!p.isAi) {
            const user = getOrCreateByUsername(p.name.trim())
            userMap.set(p.name.trim(), user)
        }
    }

    // Resolve champion
    const champion = userMap.get(championName.trim())
    if (!champion) {
        throw new BadRequestError('Champion must be a non-AI player')
    }

    // Create tournament with status finished
    const tournament = createFinishedTournamentRepo(name.trim(), champion.id)

    // Add all non-AI players to tournament_players
    for (const [, user] of userMap) {
        try {
            addPlayerToTournamentRepo(tournament.id, user.id)
        } catch {
            // ignore duplicate player errors
        }
    }

    // Save each match
    const savedMatches = matches.map((m) => {
        const p1User = userMap.get(m.player1Name.trim())
        const p2User = userMap.get(m.player2Name.trim())
        const winnerUser = userMap.get(m.winnerName.trim())

        return createFinishedMatchWithPlayers(
            winnerUser?.id ?? null,
            p1User?.id ?? 0,
            m.scorePlayer1,
            p2User?.id ?? null,
            m.scorePlayer2
        )
    })

    return {
        tournament,
        champion: champion.username,
        matchesCount: savedMatches.length
    }
}
