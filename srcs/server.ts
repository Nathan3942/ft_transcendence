import { buildApp } from './app'
import { env, isDev } from './config/env'

/**
 * Entry point for the application
 * Builds the app and starts the HTTP server
 */
async function start() {
  try {
    // Build the Fastify application
    const app = await buildApp()

    // Start listening on configured port, accessible from any network interface
    await app.listen({ port: env.PORT, host: '0.0.0.0' })

    console.log(`🚀 Server started on http://localhost:${env.PORT}`)
    console.log(`📍 Environment: ${env.NODE_ENV}`)
    console.log(`✅ CORS enabled for: ${isDev ? 'all origins' : env.FRONTEND_URL}`)
  } catch (err) {
    // Log error and exit if server fails to start
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Start the server
start()
