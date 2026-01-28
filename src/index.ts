import Fastify from 'fastify'
import cors from '@fastify/cors'
import { initDatabase, checkDatabaseHealth, initTables } from './database'
import v1Routes from './routes/v1'
import { errorHandler, notFoundHandler} from './utils/ErrorHandler'

// Create a Fastify server instance with logging enabled
const server = Fastify({
  logger: true
})

// Start the server
const start = async () => {
  try {
    // Register CORS first
    await server.register(cors, {
      origin: true  // En développement: accepte toutes les origines
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

    // Listen on port 3000, accessible from any network interface
    await server.listen({ port: 3000, host: '0.0.0.0' })
    console.log('🚀 Server started on http://localhost:3000')
    console.log('✅ CORS enabled for all origins')
  } catch (err) {
    // Log error and exit if server fails to start
    server.log.error(err)
    process.exit(1)
  }
}

// start le server
start()