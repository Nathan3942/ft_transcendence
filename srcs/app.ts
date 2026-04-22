import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import path from 'path'
import { initDatabase, checkDatabaseHealth, initTables } from './database'
import v1Routes from './routes/v1'
import { errorHandler, notFoundHandler } from './utils/ErrorHandler'
import { registerRateLimit } from './plugins/rateLimit'
import { env, isDev, isProd } from './config/env'
import { wsPlugin } from './ws'


export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true //affichage console
  })

  await app.register(cors, {
    origin: isDev ? true : env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  })

  await app.register(cookie)

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'token', signed: false }
  })

  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } }) // 5 MB max

  await app.register(staticFiles, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false
  })

  if (isProd) {
    await app.register(staticFiles, {
      root: path.join(process.cwd(), 'srcs/frontend/dist'),
      prefix: '/'
    })
  }

  await registerRateLimit(app)

  initDatabase()
  if (!checkDatabaseHealth()) {
    throw new Error('Database integrity check failed')
  }
  initTables()

  await app.register(wsPlugin);

  app.register(v1Routes, { prefix: '/api/v1' })

  app.setErrorHandler(errorHandler)

  // En prod : fallback SPA pour les routes frontend (pushState)
  if (isProd) {
    app.setNotFoundHandler((request, reply) => {
      if (!request.url.startsWith('/api/')) {
        reply.sendFile('index.html')
      } else {
        notFoundHandler(request, reply)
      }
    })
  } else {
    app.setNotFoundHandler(notFoundHandler)
  }

  return app
}

