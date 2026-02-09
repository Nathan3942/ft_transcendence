import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { initDatabase, checkDatabaseHealth, initTables, runMigrations } from './database'
import v1Routes from './routes/v1'
import { errorHandler, notFoundHandler } from './utils/ErrorHandler'
import { registerRateLimit } from './plugins/rateLimit'
import { env, isDev } from './config/env'

/**
 * Builds and configures the Fastify application instance
 * This factory function sets up all plugins, database, routes, and error handlers
 * @returns Configured Fastify instance ready to listen
 */
export async function buildApp(): Promise<FastifyInstance> {
  // Create a Fastify server instance with logging enabled
  const app = Fastify({
    logger: true
  })

  // Register CORS with frontend URL from .env
  await app.register(cors, {
    origin: isDev ? true : env.FRONTEND_URL  // Dev: all origins, Prod: only frontend
  })

  // Register rate limiting to protect against abuse
  await registerRateLimit(app)

  // Initialize database and tables before registering routes
  initDatabase()
  if (!checkDatabaseHealth()) {
    throw new Error('Database integrity check failed')
  }
  initTables()

  // Run migrations to update schema for existing databases
  runMigrations()

  // Register routes with /api/v1 prefix
  app.register(v1Routes, { prefix: '/api/v1' })

  // Set global error handlers
  app.setErrorHandler(errorHandler)
  app.setNotFoundHandler(notFoundHandler)

  return app
}
