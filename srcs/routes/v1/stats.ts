/**
 * Stats Routes
 * User stats, match history, and leaderboard
 */

import { FastifyInstance } from 'fastify'
import { success } from '../../utils/response'
import * as statsService from '../../services/statsService'
import { authenticate } from '../../plugins/authenticate'

export default async function statsRoutes(server: FastifyInstance) {

    /************************* GET USER STATS **********************************/
    server.get('/users/:id/stats', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const stats = statsService.getUserStats(id)
        return success(stats)
    })

    /************************* GET USER MATCH HISTORY — logged-in users only **********************************/
    server.get('/users/:id/matches', { preHandler: authenticate }, async (request, _reply) => {
        const { id } = request.params as { id: string }
        const matches = statsService.getUserMatchHistory(id)
        return success(matches)
    })

    /************************* GET LEADERBOARD **********************************/
    server.get('/leaderboard', async (request, _reply) => {
        const { limit } = request.query as { limit?: string }
        const parsedLimit = limit ? parseInt(limit) : 20
        const leaderboard = statsService.getLeaderboard(parsedLimit)
        return success(leaderboard)
    })
}
