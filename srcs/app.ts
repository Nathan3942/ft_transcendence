import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import path from 'path'
import { initDatabase, checkDatabaseHealth, initTables } from './database'
import v1Routes from './routes/v1'
import { errorHandler, notFoundHandler } from './utils/ErrorHandler'
import { registerRateLimit } from './plugins/rateLimit'
import { env, isDev } from './config/env'

/**
 * creation et config du server fastify
 * plugind db error handler global et routes
 * @returns l'instance fastify prete
 */
export async function buildApp(): Promise<FastifyInstance> {
  //creation server avec logger pour affichage console
  const app = Fastify({
    logger: true
  })

  // Cors setup
  await app.register(cors, {
    origin: isDev ? true : env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })

  // JWT — disponible via server.jwt.sign() et request.jwtVerify()
  await app.register(jwt, {
    secret: env.JWT_SECRET
  })

  // Multipart — parsing fichiers uploadés (avatars)
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } }) // 5 MB max

  // Static — sert les fichiers uploadés depuis /uploads
  await app.register(staticFiles, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/'
  })

  //rate limit pour eviter trop de request
  await registerRateLimit(app)

  initDatabase()
  if (!checkDatabaseHealth()) {
    throw new Error('Database integrity check failed')
  }
  initTables()

  app.register(v1Routes, { prefix: '/api/v1' })

  app.setErrorHandler(errorHandler)
  app.setNotFoundHandler(notFoundHandler)

  return app
}
