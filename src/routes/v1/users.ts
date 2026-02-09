/**
 * Users Routes
 * Handles HTTP requests for user operations
 * All business logic delegated to userService
 */

import { FastifyInstance } from 'fastify'
import { success } from '../../utils/response'
import * as userService from '../../services/userService'

export default async function usersRoutes(server: FastifyInstance) {

    /************************* POST USERS **********************************/
    server.post('/users', async (request, reply) => {
        const { username } = request.body as { username: string }
        const user = await userService.createUser(username)
        return success(user)// equivalent ->return reply.status(200).send(success(user))
    })

    /************************* GET ALL USERS **********************************/
    server.get('/users', async (request, reply) => {
        const users = userService.getAllUsers()
        return success(users)
    })

    /************************* GET USER BY ID **********************************/
    server.get('/users/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const user = userService.getUserById(id)
        return success(user)
    })

    /************************* DELETE USER **********************************/
    server.delete('/users/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const result = userService.deleteUser(id)
        reply.status(200)
        return success(result)
    })

    /************************* PATCH USER **********************************/
    server.patch('/users/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        const { username } = request.body as { username: string }
        const updatedUser = userService.updateUser(id, username)
        return success(updatedUser)
    })
}
