import { FastifyInstance } from 'fastify'
import { success } from '../../utils/response'
import { NotFoundError, BadRequestError } from '../../utils/appErrors'
import {
    getAllMatches,
    getMatchById,
    createMatch,
    deleteMatch,
    getMatchesByTournament,
    addPlayerToMatch,
    updateMatchPlayerScore,
    getMatchWithPlayers
} from '../../repository/matchesRepository'
import { getTournamentById } from '../../repository/tournamentsRepository'
import { getById as getUserById } from '../../repository/usersRepository'
import { z } from 'zod'

export default async function matchesRoutes(server: FastifyInstance) {

    /************************* GET ALL MATCHES **********************************/
    server.get('/matches', async (request, reply) => {
        const matches = getAllMatches()
        return success(matches)
    })

    /************************* GET MATCH BY ID **********************************/
    server.get('/matches/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const match = getMatchWithPlayers(id)
        
        if (!match) {
            throw new NotFoundError('Match not found')
        }
        
        return success(match)
    })

    /************************* CREATE MATCH **********************************/
    server.post('/matches', async (request, reply) => {
        const matchSchema = z.object({
            tournamentId: z.number().int().positive('tournamentId must be a positive integer'),
            round: z.number().int().positive('round must be a positive integer')
        })

        const result = matchSchema.safeParse(request.body)
        if (!result.success) {
            throw new BadRequestError('Invalid match data')
        }

        // Check tournament exists
        const tournament = getTournamentById(result.data.tournamentId)
        if (!tournament) {
            throw new NotFoundError('Tournament not found')
        }

        const match = createMatch({
            tournamentId: result.data.tournamentId,
            round: result.data.round
        })
        return success(match)
    })

    /************************* DELETE MATCH **********************************/
    server.delete('/matches/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        
        const match = getMatchById(id)
        if (!match) {
            throw new NotFoundError('Match not found')
        }

        const result = deleteMatch(id)
        if (result.changes === 0) {
            throw new NotFoundError('Match not found')
        }

        return success({ message: 'Match deleted', id: parseInt(id) })
    })

    /************************* GET MATCHES BY TOURNAMENT **********************************/
    server.get('/tournaments/:tournamentId/matches', async (request, reply) => {
        const { tournamentId } = request.params as { tournamentId: string }
        
        const tournament = getTournamentById(tournamentId)
        if (!tournament) {
            throw new NotFoundError('Tournament not found')
        }

        const matches = getMatchesByTournament(tournamentId)
        return success(matches)
    })

    /************************* ADD PLAYER TO MATCH **********************************/
    server.post('/matches/:id/players', async (request, reply) => {
        const { id } = request.params as { id: string }
        
        const playerSchema = z.object({
            userId: z.number().int().positive('userId must be a positive integer'),
            score: z.number().int().min(0).nullable().optional()
        })

        const result = playerSchema.safeParse(request.body)
        if (!result.success) {
            throw new BadRequestError('Invalid player data')
        }

        // Check match exists
        const match = getMatchById(id)
        if (!match) {
            throw new NotFoundError('Match not found')
        }

        // Check user exists
        const user = getUserById(result.data.userId)
        if (!user) {
            throw new NotFoundError('User not found')
        }

        try {
            const matchPlayer = addPlayerToMatch(
                parseInt(id),
                result.data.userId,
                result.data.score ?? null
            )
            return success(matchPlayer)
        } catch (err: any) {
            if (err.message.includes('already assigned')) {
                throw new BadRequestError('Player already assigned to this match')
            }
            throw err
        }
    })

    /************************* UPDATE MATCH SCORE **********************************/
    server.patch('/matches/:id/score', async (request, reply) => {
        const { id } = request.params as { id: string }
        
        const scoreSchema = z.object({
            userId: z.number().int().positive('userId must be a positive integer'),
            score: z.number().int().min(0, 'score must be a non-negative integer')
        })

        const result = scoreSchema.safeParse(request.body)
        if (!result.success) {
            throw new BadRequestError('Invalid score data')
        }

        // Check match exists
        const match = getMatchById(id)
        if (!match) {
            throw new NotFoundError('Match not found')
        }

        // Check user exists
        const user = getUserById(result.data.userId)
        if (!user) {
            throw new NotFoundError('User not found')
        }

        const updateResult = updateMatchPlayerScore(
            parseInt(id),
            result.data.userId,
            result.data.score
        )

        if (updateResult.changes === 0) {
            throw new NotFoundError('Player not found in this match')
        }

        return success({
            matchId: parseInt(id),
            userId: result.data.userId,
            score: result.data.score
        })
    })
}
