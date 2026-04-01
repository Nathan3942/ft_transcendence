/**
 * Rate Limit Plugin
 * Protects the API from abuse by limiting request rate
 */

import rateLimit from '@fastify/rate-limit'
import { FastifyInstance } from 'fastify'

/**
 * Registers rate limiting with appropriate configuration
 * Global limit: 100 requests per minute per IP
 * Can be overridden per route if needed
 */
export async function registerRateLimit(app: FastifyInstance) {
    await app.register(rateLimit, {
        max: 100, // Maximum 100 requests
        timeWindow: '1 minute', // Per 1 minute window
        cache: 10000, // Cache 10000 clients
        allowList: [], // No whitelist by default (can add trusted IPs later)
        redis: undefined, // Use in-memory cache (use Redis in production for multi-instance deployment)
        skipOnError: false, // Do not skip rate limiting on errors
        ban: undefined, // No permanent ban (can configure if needed)
        onBanReach: (req, key) => {
            // Log when a client reaches the limit
            req.log.warn({ key }, 'Rate limit exceeded')
        },
        errorResponseBuilder: (req, context) => {
            return {
                error: 'TooManyRequests',
                message: 'Rate limit exceeded. Please try again later.',
                details: []
            }
        }
    })
}
