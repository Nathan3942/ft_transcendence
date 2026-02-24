/**
 * Users Routes
 * Handles HTTP requests for user operations
 * All business logic delegated to userService
 */

import { FastifyInstance } from 'fastify'
import { success } from '../../utils/response'
import * as userService from '../../services/userService'
import { authenticate } from '../../plugins/authenticate'
import { ForbiddenError } from '../../utils/appErrors'

export default async function usersRoutes(server: FastifyInstance) {

    /************************* GET ALL USERS **********************************/
    server.get('/users', async (_request, _reply) => {
        const users = userService.getAllUsers()
        return success(users)
    })

    /************************* GET USER BY ID **********************************/
    server.get('/users/:id', async (request, _reply) => {
        const { id } = request.params as { id: string }
        const user = userService.getUserById(id)
        return success(user)
    })

    /************************* PATCH USER — requiert auth + ownership **********************************/
    server.patch('/users/:id', { preHandler: authenticate }, async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { id: tokenId } = request.user as { id: number; username: string }

        if (parseInt(id) !== tokenId) {
            throw new ForbiddenError('You can only update your own profile')
        }

        const fields = request.body as { username?: string; display_name?: string; avatar_url?: string }
        const updatedUser = userService.updateUser(id, fields)
        return success(updatedUser)
    })

    /************************* DELETE USER — requiert auth + ownership **********************************/
    server.delete('/users/:id', { preHandler: authenticate }, async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { id: tokenId } = request.user as { id: number; username: string }

        if (parseInt(id) !== tokenId) {
            throw new ForbiddenError('You can only delete your own account')
        }

        const result = userService.deleteUser(id)
        return success(result)
    })
}
