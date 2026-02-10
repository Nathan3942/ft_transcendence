import type { FastifyInstance } from 'fastify'
import { success, errorResponse } from '../../utils/response'




export async function healthCheckRoute(server:FastifyInstance){

    server.get('/ping', async (request, reply) => {
        return success("pong");
})
}
