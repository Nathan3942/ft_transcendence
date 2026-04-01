/**
 * Friends Routes
 * POST   /users/:id/friends              — envoyer une demande d'ami
 * PATCH  /users/:id/friends/:friendId    — accepter ou refuser
 * GET    /users/:id/friends              — liste des amis (avec statut online)
 * GET    /users/:id/friends/requests     — demandes entrantes en attente
 * DELETE /users/:id/friends/:friendId    — supprimer un ami
 */

import { FastifyInstance } from 'fastify'
import { success } from '../../utils/response'
import * as friendsService from '../../services/friendsService'
import { authenticate } from '../../plugins/authenticate'
import { ForbiddenError, BadRequestError } from '../../utils/appErrors'

export default async function friendsRoutes(server: FastifyInstance) {

    /******** POST /users/:id/friends — envoyer une demande d'ami ********/
    // :id = requester (doit correspondre au token)
    // body: { friendId: number }
    server.post('/users/:id/friends', { preHandler: authenticate }, async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { id: tokenId } = request.user as { id: number; username: string }

        if (parseInt(id) !== tokenId) {
            throw new ForbiddenError('You can only send friend requests as yourself')
        }

        const { friendId } = request.body as { friendId: number }
        if (!friendId) {
            throw new BadRequestError('Missing friendId in body')
        }

        const friendship = friendsService.sendFriendRequest(tokenId, friendId)
        return success(friendship)
    })

    /******** PATCH /users/:id/friends/:friendId — accepter ou refuser ********/
    // :id = addressee (doit correspondre au token)
    // :friendId = requester (celui qui a envoyé)
    // body: { action: "accept" | "reject" }
    server.patch('/users/:id/friends/:friendId', { preHandler: authenticate }, async (request, _reply) => {
        const { id, friendId } = request.params as { id: string; friendId: string }
        const { id: tokenId } = request.user as { id: number; username: string }

        if (parseInt(id) !== tokenId) {
            throw new ForbiddenError('You can only respond to your own friend requests')
        }

        const { action } = request.body as { action?: string }
        if (action !== 'accept' && action !== 'reject') {
            throw new BadRequestError('action must be "accept" or "reject"')
        }

        const result = friendsService.respondToRequest(tokenId, parseInt(friendId), action)
        return success(result)
    })

    /******** GET /users/:id/friends/requests — demandes entrantes pending ********/
    // Route déclarée AVANT /users/:id/friends/:friendId pour éviter conflit
    server.get('/users/:id/friends/requests', { preHandler: authenticate }, async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { id: tokenId } = request.user as { id: number; username: string }

        if (parseInt(id) !== tokenId) {
            throw new ForbiddenError('You can only view your own friend requests')
        }

        const requests = friendsService.getPendingRequests(tokenId)
        return success(requests)
    })

    /******** GET /users/:id/friends — liste des amis acceptés ********/
    server.get('/users/:id/friends', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const friends = friendsService.getFriends(parseInt(id))
        return success(friends)
    })

    /******** DELETE /users/:id/friends/:friendId — supprimer un ami ********/
    server.delete('/users/:id/friends/:friendId', { preHandler: authenticate }, async (request, _reply) => {
        const { id, friendId } = request.params as { id: string; friendId: string }
        const { id: tokenId } = request.user as { id: number; username: string }

        if (parseInt(id) !== tokenId) {
            throw new ForbiddenError('You can only remove your own friends')
        }

        const result = friendsService.removeFriend(tokenId, parseInt(friendId))
        return success(result)
    })
}
