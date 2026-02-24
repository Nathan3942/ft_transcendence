/* Middleware d'authentification réutilisable
   Usage : { preHandler: authenticate }
   Injecte request.user = { id, username } si le token est valide
   Retourne 401 automatiquement si token absent ou invalide */

import { FastifyRequest, FastifyReply } from 'fastify'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    await request.jwtVerify()
}
