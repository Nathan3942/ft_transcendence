/**
 * Tournaments Routes
 * Handles HTTP requests for tournament operations
 * All business logic delegated to tournamentService
 */

import { FastifyInstance } from 'fastify'
import { success } from '../../utils/response'
import * as tournamentService from '../../services/tournamentService'

export default async function tournamentsRoutes(server: FastifyInstance) {

    /************************* GET ALL TOURNAMENTS **********************************/
    server.get('/tournaments', async (request, reply) => {
        const tournaments = tournamentService.getAllTournaments()
        return success(tournaments)
    })

    /************************* GET TOURNAMENT BY ID **********************************/
    server.get('/tournaments/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const tournament = tournamentService.getTournamentById(id)
        return success(tournament)
    })

    /************************* CREATE TOURNAMENT **********************************/
    server.post('/tournaments', async (request, reply) => {
        const { name } = request.body as { name: string }
        const tournament = tournamentService.createTournament(name)
        return success(tournament)
    })

    /************************* DELETE TOURNAMENT **********************************/
    server.delete('/tournaments/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const result = tournamentService.deleteTournament(id)
        return success(result)
    })

    /************************* UPDATE MATCH STATUS **********************************/
    server.patch('/tournaments/:id/status', async (request, reply) => {
        const { id } = request.params as { id: string }
        const { status } = request.body as { status: 'open' | 'in_progress' | 'finished' }
        const result = tournamentService.updateTournamentStatus(id, status)
        return success(result)
    })

    /************************* ADD PLAYER TO TOURNAMENT **********************************/
    server.post('/tournaments/:id/players', async (request, reply) => {
        const { id } = request.params as { id: string }
        const { userId } = request.body as { userId: number }
        const tournamentPlayer = tournamentService.addPlayerToTournament(id, userId)
        return success(tournamentPlayer)
    })

    /************************* GET TOURNAMENT PLAYERS **********************************/
    server.get('/tournaments/:id/players', async (request, reply) => {
        const { id } = request.params as { id: string }
        const players = tournamentService.getTournamentPlayers(id)
        return success(players)
    })

    /************************* SAVE TOURNAMENT RESULT **********************************/
    server.post('/tournaments/result', async (request, _reply) => {
        const body = request.body as {
            name: string;
            players: { name: string; isAi: boolean }[];
            matches: {
                player1Name: string;
                player2Name: string;
                scorePlayer1: number;
                scorePlayer2: number;
                winnerName: string;
                round: number;
            }[];
            championName: string;
        }
        const result = tournamentService.saveTournamentResult(body)
        return success(result)
    })
}
