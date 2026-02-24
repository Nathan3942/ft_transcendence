//register toutes les routes de la v1

import type { FastifyInstance } from 'fastify'
import usersRoutes from './users'
import tournamentsRoutes from './tournaments'
import matchesRoutes from './matches'
import statsRoutes from './stats'
import { healthCheckRoute } from './healthCheck'

//register toutes les routes de ma v1
export default async function v1Routes(server: FastifyInstance){
    server.register(healthCheckRoute)
    server.register(usersRoutes)
    server.register(tournamentsRoutes)
    server.register(matchesRoutes)
    server.register(statsRoutes)
}



