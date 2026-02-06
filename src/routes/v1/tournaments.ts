import { FastifyInstance } from 'fastify'
import { success } from '../../utils/response'
import { NotFoundError, BadRequestError } from '../../utils/appErrors'
import {
    getAllTournaments,
    getTournamentById,
    createTournament,
    deleteTournament,
    addPlayerToTournament,
    getTournamentPlayers,
    getTournamentWithPlayers
} from '../../repository/tournamentsRepository'
import { getById as getUserById } from '../../repository/usersRepository'
import { z } from 'zod'

export default async function tournamentsRoutes(server: FastifyInstance) {

    /************************* GET ALL TOURNAMENTS **********************************/
    server.get('/tournaments', async (request, reply) => {
        const tournaments = getAllTournaments()
        return success(tournaments)
    })

    /************************* GET TOURNAMENT BY ID **********************************/
    server.get('/tournaments/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const tournament = getTournamentWithPlayers(id)
        
        if (!tournament) {
            throw new NotFoundError('Tournament not found')
        }
        
        return success(tournament)
    })

    /************************* CREATE TOURNAMENT **********************************/
    server.post('/tournaments', async (request, reply) => {
        const tournamentSchema = z.object({
            name: z.string().min(1, 'Tournament name is required')
        })

        const result = tournamentSchema.safeParse(request.body)
        if (!result.success) {
            throw new BadRequestError('Invalid tournament data')
        }

        try {
            const tournament = createTournament({ name: result.data.name })
            return success(tournament)
        } catch (err: any) {
            if (err.message.includes('already exists')) {
                throw new BadRequestError('Tournament with this name already exists')
            }
            throw err
        }
    })

    /************************* DELETE TOURNAMENT **********************************/
    server.delete('/tournaments/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        
        const tournament = getTournamentById(id)
        if (!tournament) {
            throw new NotFoundError('Tournament not found')
        }

        const result = deleteTournament(id)
        if (result.changes === 0) {
            throw new NotFoundError('Tournament not found')
        }

        return success({ message: 'Tournament deleted', id: parseInt(id) })
    })

    /************************* ADD PLAYER TO TOURNAMENT **********************************/
    server.post('/tournaments/:id/players', async (request, reply) => {
        const { id } = request.params as { id: string }
        
        const playerSchema = z.object({
            userId: z.number().int().positive('userId must be a positive integer')
        })

        const result = playerSchema.safeParse(request.body)
        if (!result.success) {
            throw new BadRequestError('Invalid player data')
        }

        // Check tournament exists
        const tournament = getTournamentById(id)
        if (!tournament) {
            throw new NotFoundError('Tournament not found')
        }

        // Check user exists
        const user = getUserById(result.data.userId)
        if (!user) {
            throw new NotFoundError('User not found')
        }

        try {
            const tournamentPlayer = addPlayerToTournament(parseInt(id), result.data.userId)
            return success(tournamentPlayer)
        } catch (err: any) {
            if (err.message.includes('already registered')) {
                throw new BadRequestError('Player already registered for this tournament')
            }
            throw err
        }
    })

    /************************* GET TOURNAMENT PLAYERS **********************************/
    server.get('/tournaments/:id/players', async (request, reply) => {
        const { id } = request.params as { id: string }
        
        const tournament = getTournamentById(id)
        if (!tournament) {
            throw new NotFoundError('Tournament not found')
        }

        const players = getTournamentPlayers(id)
        return success(players)
    })
}