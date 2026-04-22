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
    createFinishedTournament as createFinishedTournamentRepo,
    updateTournamentStatusRepo
} from '../repository/tournamentsRepository'
import { getById as getUserById, getOrCreateByUsername } from '../repository/usersRepository'
import { createFinishedMatchWithPlayers } from '../repository/matchesRepository'
import { NotFoundError, BadRequestError } from '../utils/appErrors'
import { Tournament, TournamentPlayer, TournamentStatus, TournamentWithPlayers } from '../models/tournamentModel'

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

export function getTournamentStatus(tournamentId: string | number) {
    const tournament = getTournamentByIdRepo(tournamentId);
    return tournament?.status;
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


export function updateTournamentStatus(
    tournamentId: string | number,
    status: TournamentStatus
): { message: string; tournamentId: number; status: TournamentStatus } {
    const validStatuses: TournamentStatus[] = ['open', 'in_progress', 'finished']
    if (!validStatuses.includes(status)) {
        throw new BadRequestError('status must be one of: pending, in_progress, finished')
    }

    const tournament = getTournamentByIdRepo(tournamentId)
    if (!tournament) {
        throw new NotFoundError('Match not found')
    }

    // Validate status transitions
    if (tournament.status === 'finished') {
        throw new BadRequestError('Cannot change status of a finished tournament')
    }

    const numericTournamentId = typeof tournamentId === 'string' ? parseInt(tournamentId) : tournamentId
    const updateResult = updateTournamentStatusRepo(numericTournamentId, status)

    if (updateResult.changes === 0) {
        throw new NotFoundError('Tournament not found')
    }

    return {
        message: 'Tournament status updated',
        tournamentId: numericTournamentId,
        status
    }
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

    /* On crée TOUS les joueurs en base (humains ET bots)
       car la table match_player a une FK sur users(id)
       Un bot est simplement un user avec un nom comme "Bot 1" */
    const userMap = new Map<string, { id: number; username: string }>()
    for (const p of players) {
        const user = getOrCreateByUsername(p.name.trim())
        userMap.set(p.name.trim(), user)
    }

    // Résoudre le champion (peut être un bot ou un humain)
    const champion = userMap.get(championName.trim())
    if (!champion) {
        throw new BadRequestError('Champion not found in players list')
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

        /* Tous les joueurs (humains et bots) sont maintenant dans userMap,
           donc p1User et p2User existent toujours */
        return createFinishedMatchWithPlayers(
            winnerUser?.id ?? null,
            p1User!.id,
            m.scorePlayer1,
            p2User!.id,
            m.scorePlayer2,
            "1v1"
        )
    })

    return {
        tournament,
        champion: champion.username,
        matchesCount: savedMatches.length
    }
}
