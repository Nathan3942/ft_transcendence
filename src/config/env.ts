/*
 * Configuration des variables d'environnement
 *
 * CE FICHIER FAIT QUOI :
 * 1. Charge les variables depuis .env (via dotenv)
 * 2. Valide que toutes les variables requises existent (via Zod)
 * 3. Exporte un objet "env" typé et validé
 *
 * POURQUOI C'EST IMPORTANT :
 * - Le serveur crashe IMMEDIATEMENT si une variable manque
 * - Pas de surprise en production avec des undefined
 * - TypeScript connaît le type exact de chaque variable
 */

import { z } from 'zod'
import { config as dotenvConfig } from 'dotenv'

// Charge le fichier .env dans process.env
dotenvConfig()

// Schéma de validation Zod
// Chaque variable est décrite avec son type et ses contraintes
const envSchema = z.object({
  // Environnement d'exécution
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Port du serveur HTTP Fastify
  PORT: z.string().default('3000').transform(Number),

  // Port WebSocket pour le jeu Pong temps réel
  WS_PORT: z.string().default('3001').transform(Number),

  // Chemin vers la base de données SQLite
  DATABASE_PATH: z.string().default('./data/transcendence.db'),

  // URL du frontend pour configurer CORS
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
})

// Valide process.env contre le schéma
// Si validation échoue -> crash avec message d'erreur clair
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Configuration invalide:')
  console.error(parsed.error.format())
  process.exit(1)
}

// Export l'objet validé et typé
export const env = parsed.data

// Helpers pour vérifier l'environnement
export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Ancien export pour compatibilité (à supprimer plus tard)
export const config = {
  database: {
    path: env.DATABASE_PATH
  }
} as const
