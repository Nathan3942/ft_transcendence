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
        const { tournamentId, round, status } = request.body as {
            tournamentId: number | null;
            round: number | null;
            status?: 'pending' | 'in_progress' | 'finished';
        }
        const match = matchService.createMatch(
            tournamentId ?? null,
            round ?? null,
            status ?? 'pending'
        )
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

    /************************* UPDATE MATCH STATUS **********************************/
    server.patch('/matches/:id/status', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { status } = request.body as { status: 'pending' | 'in_progress' | 'finished' }
        const result = matchService.updateMatchStatus(id, status)
        return success(result)
    })

    /************************* START MATCH **********************************/
    server.post('/matches/:id/start', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const result = matchService.startMatch(id)
        return success(result)
    })

    /************************* FINISH MATCH **********************************/
    server.post('/matches/:id/finish', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { winnerId } = request.body as { winnerId: number | null }
        const result = matchService.finishMatch(id, winnerId ?? null)
        return success(result)
    })

    /************************* GET MATCHES BY STATUS **********************************/
    server.get('/matches/status/:status', async (request, _reply) => {
        const { status } = request.params as { status: 'pending' | 'in_progress' | 'finished' }
        const matches = matchService.getMatchesByStatus(status)
        return success(matches)
    })

    /************************* SAVE MATCH RESULT **********************************/
    server.post('/matches/result', async (request, _reply) => {
        const { player1Id, player2Id, scorePlayer1, scorePlayer2, winnerId } = request.body as {
            player1Id: number;
            player2Id: number | null;
            scorePlayer1: number;
            scorePlayer2: number;
            winnerId: number | null;
        }
        const match = matchService.saveMatchResult(
            player1Id,
            player2Id,
            scorePlayer1,
            scorePlayer2,
            winnerId
        )
        return success(match)
    })

}
