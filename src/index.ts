import Fastify from 'fastify'
import cors from '@fastify/cors'
import { initDatabase, checkDatabaseHealth, initTables } from './database'
import v1Routes from './routes/v1'
import { errorHandler, notFoundHandler} from './utils/ErrorHandler'
import { env, isDev } from './config/env'

// Cree une instance fastify avec logging
const server = Fastify({
  logger: true //affichage console
})

// Start mon server
const start = async () => {
  try {
    // Register CORS avec l'URL du frontend depuis .env
    await server.register(cors, {
      origin: isDev ? true : env.FRONTEND_URL  // Dev: toutes origines, Prod: uniquement frontend
    })

    // Initialize database and tables before starting the server
    initDatabase()
    if (!checkDatabaseHealth()) {
      console.error('Database integrity check failed')
      process.exit(1)
    }
    initTables()

    // Register routes
    server.register(v1Routes, { prefix: '/api/v1' })

    // Set error handlers
    server.setErrorHandler(errorHandler)
    server.setNotFoundHandler(notFoundHandler)

    // Listen on port from .env, accessible from any network interface
    await server.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`🚀 Server started on http://localhost:${env.PORT}`)
    console.log(`📍 Environment: ${env.NODE_ENV}`)
    console.log(`✅ CORS enabled for: ${isDev ? 'all origins' : env.FRONTEND_URL}`)
  } catch (err) {
    // Log error and exit if server fails to start
    server.log.error(err)
    process.exit(1)
  }
}

// start le server
start()