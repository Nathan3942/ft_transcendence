//index file contains all routes from api/v1

import { FastifyInstance } from 'fastify'
import usersRoutes from './users'
import tournamentsRoutes from './tournaments'

//register all v1 routes and add the prefix api/v1
export default async function v1Routes(fastify: FastifyInstance){
    fastify.register(usersRoutes)
}



