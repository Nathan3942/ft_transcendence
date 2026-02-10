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

//lis code du package dotenv -> charge parse .env et ajoute les variables a process.env
dotenvConfig()

//schema zod check si .env conforme
const envSchema = z.object({
  // Environnement d'exécution
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.string().default('3000').transform(Number), 

  WS_PORT: z.string().default('3001').transform(Number),

  DATABASE_PATH: z.string().default('./data/transcendence.db'),

  // URL du frontend pour config CORS
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
})


//check si process.env conforme au schema zod en comparant
const parsed = envSchema.safeParse(process.env)
console.log(process.env.HOME)   // "/Users/teo18"
console.log(process.env.PATH)   // "/usr/bin:/bin:/usr/local/bin"

if (!parsed.success) {
  console.error('❌ Configuration invalide:')
  console.error(parsed.error)
  process.exit(1)
}

// Export env puisqu'il est valide
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
