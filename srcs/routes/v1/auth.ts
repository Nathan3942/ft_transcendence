/* Routes d'authentification
   POST /auth/register  — inscription
   POST /auth/login     — connexion, retourne un JWT
   POST /auth/logout    — deconnexion (requiert JWT)
   GET  /auth/me        — retourne le user courant depuis le token */

import { FastifyInstance } from 'fastify'
import * as authService from '../../services/authService'
import * as userService from '../../services/userService'
import { success } from '../../utils/response'
import { authenticate } from '../../plugins/authenticate'
import { isDev } from '../../config/env'

export default async function authRoutes(server: FastifyInstance) {

    /************************* POST /auth/register **********************************/
    server.post('/auth/register', async (request, reply) => {
        const { username, email, password } = request.body as {
            username: string
            email: string
            password: string
        }

        const { user, payload } = await authService.register(username, email, password)
        const token = server.jwt.sign(payload, { expiresIn: '7d' })

        reply.setCookie('token', token, {
            httpOnly: true,
            secure: !isDev,
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        })

        reply.status(201)
        return success({ user })
    })

    /************************* POST /auth/login **********************************/
    server.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body as {
            email: string
            password: string
        }

        const { user, payload } = await authService.login(email, password)
        const token = server.jwt.sign(payload, { expiresIn: '7d' })

        reply.setCookie('token', token, {
            httpOnly: true,
            secure: !isDev,
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        })

        return success({ user })
    })

    /************************* GET /auth/me **********************************/
    server.get('/auth/me', { preHandler: authenticate }, async (request, _reply) => {
        const { id } = request.user as { id: number; username: string }
        const user = userService.getUserById(id)
        return success(user)
    })

    /************************* POST /auth/logout **********************************/
    server.post('/auth/logout', { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.user as { id: number; username: string }
        authService.logout(id)
        reply.clearCookie('token', { path: '/' })
        return success({ message: 'Logged out' })
    })
}
