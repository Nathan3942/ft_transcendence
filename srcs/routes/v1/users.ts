/**
 * Users Routes
 * Handles HTTP requests for user operations
 * All business logic delegated to userService
 */

import { FastifyInstance } from 'fastify'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { success } from '../../utils/response'
import * as userService from '../../services/userService'
import { authenticate } from '../../plugins/authenticate'
import { BadRequestError, ForbiddenError } from '../../utils/appErrors'

const AVATAR_DIR = path.join(process.cwd(), 'uploads', 'avatars')
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

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

    /************************* PATCH USER — update email / display_name **********************************/
    server.patch('/users/:id', { preHandler: authenticate }, async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { id: tokenId } = request.user as { id: number; username: string }

        if (parseInt(id) !== tokenId) {
            throw new ForbiddenError('You can only update your own profile')
        }

        const fields = request.body as { username?: string; email?: string; display_name?: string; avatar_url?: string }
        const updatedUser = userService.updateUser(id, fields)
        return success(updatedUser)
    })

    /************************* POST /users/:id/avatar — upload image multipart **********************************/
    server.post('/users/:id/avatar', { preHandler: authenticate }, async (request, _reply) => {
        const { id } = request.params as { id: string }
        const { id: tokenId } = request.user as { id: number; username: string }

        if (parseInt(id) !== tokenId) {
            throw new ForbiddenError('You can only update your own avatar')
        }

        const data = await request.file()
        if (!data) {
            throw new BadRequestError('No file provided')
        }
        if (!ALLOWED_MIME.includes(data.mimetype)) {
            throw new BadRequestError('Invalid file type. Allowed: jpeg, png, gif, webp')
        }

        // Crée le dossier si inexistant
        await mkdir(AVATAR_DIR, { recursive: true })

        const ext = path.extname(data.filename) || '.jpg'
        const filename = `avatar-${id}-${Date.now()}${ext}`
        const filepath = path.join(AVATAR_DIR, filename)

        await pipeline(data.file, createWriteStream(filepath))

        const avatar_url = `/uploads/avatars/${filename}`
        const updatedUser = userService.updateUser(id, { avatar_url })
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
