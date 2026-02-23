import { buildApp } from './app'
import { env, isDev } from './config/env'

//point d'entree
async function start() {
  try {
    //attend la creation de l'instance fastify
    const app = await buildApp()

    await app.listen({ port: env.PORT, host: '0.0.0.0' })

    console.log('isDev:', isDev)
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
