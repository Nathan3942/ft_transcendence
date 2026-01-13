import { FastifyRequest, FastifyReply } from 'fastify'
import {errorResponse } from './response'

/**
 * Wrapper pour capturer automatiquement les erreurs async dans les routes
 * Usage: Fastify.get('/route', asyncHandler(async (request, reply) => { ... }))
 * permet d'ajouter un try catch a la fonction fn
 */
export const asyncHandler = (
    fn: (request: FastifyRequest, reply: FastifyReply) => Promise<any>
) => {
    return async (request: FastifyRequest, reply: FastifyReply) => { //new async function returned with fn inside
        try {
            await fn(request, reply)
        } catch (error) {
            if(error instanceof Error){
                reply.send(errorResponse('500', error.message))
            }
            else{
                reply.send(errorResponse('500', 'unknown error'))
            }
        }
    }
}