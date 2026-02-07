/**
 * Matches Routes
 * Handles HTTP requests for match operations
 * All business logic delegated to matchService
 */

import { FastifyInstance } from 'fastify'
import { success } from '../../utils/response'
import * as matchService from '../../services/matchService'

export default async function matchesRoutes(server: FastifyInstance) {

    /************************* GET ALL MATCHES **********************************/
    server.get('/matches', async (_request, _reply) => {
        const matches = matchService.getAllMatches()
        return success(matches)
    })

    /************************* GET MATCH BY ID **********************************/
    server.get('/matches/:id', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const match = matchService.getMatchById(id)
        return success(match)
    })

    /************************* CREATE MATCH **********************************/
    server.post('/matches', async (request, _reply) => {
        const { tournamentId, round } = request.body as { tournamentId: number; round: number }
        const match = matchService.createMatch(tournamentId, round)
        return success(match)
    })

    /************************* DELETE MATCH **********************************/
    server.delete('/matches/:id', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const result = matchService.deleteMatch(id)
        return success(result)
    })

    /************************* GET MATCHES BY TOURNAMENT **********************************/
    server.get('/tournaments/:tournamentId/matches', async (request, _reply) => {
        const { tournamentId } = request.params as { tournamentId: string }
        const matches = matchService.getMatchesByTournament(tournamentId)
        return success(matches)
    })

    /************************* ADD PLAYER TO MATCH **********************************/
    server.post('/matches/:id/players', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { userId, score } = request.body as { userId: number; score?: number | null }
        const matchPlayer = matchService.addPlayerToMatch(id, userId, score ?? null)
        return success(matchPlayer)
    })

    /************************* UPDATE MATCH SCORE **********************************/
    server.patch('/matches/:id/score', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { userId, score } = request.body as { userId: number; score: number }
        const result = matchService.updateMatchPlayerScore(id, userId, score)
        return success(result)
    })
}
