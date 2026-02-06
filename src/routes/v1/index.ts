//index file contains all routes from api/v1

import type { FastifyInstance } from 'fastify'
import usersRoutes from './users'
import tournamentsRoutes from './tournaments'
import matchesRoutes from './matches'
import { healthCheckRoute } from './healthCheck'

//register all v1 routes and add the prefix api/v1
export default async function v1Routes(server: FastifyInstance){
    server.register(healthCheckRoute)
    server.register(usersRoutes)
    server.register(tournamentsRoutes)
    server.register(matchesRoutes)
}



