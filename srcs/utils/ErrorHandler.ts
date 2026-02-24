/**
 * Error Handler
 * Centralized error handling for Fastify
 * Fastify has a default error handler that catches all errors automatically
 * and returns status code 500 with a generic message.
 * This custom handler provides better error responses and production safety.
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import { BaseError } from './appErrors'
import { env, isProd } from '../config/env'

/**
 * Custom error handler for Fastify
 * - In development: returns detailed error information for debugging
 * - In production: returns generic error messages to avoid leaking implementation details
 */
export function errorHandler(
    error: unknown,
    request: FastifyRequest,
    reply: FastifyReply
) {
    // Log all errors for monitoring
    request.log.error({
        error,
        url: request.url,
        method: request.method,
        params: request.params,
        query: request.query
    }, 'Error occurred')

    // Handle known application errors (BaseError instances)
    if (error instanceof BaseError) {
        return reply.status(error.statusCode).send({
            error: error.name,
            message: isProd ? getProductionMessage(error.statusCode) : error.message,
            details: isProd ? [] : (error.details ?? [])
        })
    }

    // Handle HTTP errors from Fastify plugins (ex: @fastify/jwt)
    // Ces erreurs ont un statusCode mais ne sont pas des BaseError
    if (error instanceof Error && 'statusCode' in error) {
        const statusCode = (error as any).statusCode as number
        return reply.status(statusCode).send({
            error: error.name || 'HttpError',
            message: isProd ? getProductionMessage(statusCode) : error.message,
            details: []
        })
    }

    // Handle unexpected errors (500 Internal Server Error)
    // In production, NEVER expose internal error details
    return reply.status(500).send({
        error: 'InternalServerError',
        message: isProd
            ? 'An unexpected error occurred. Please try again later.'
            : (error instanceof Error ? error.message : 'Unexpected error'),
        details: []
    })
}

/**
 * Generic production-safe error messages based on status code
 * Never exposes implementation details or stack traces
 */
function getProductionMessage(statusCode: number): string {
    switch (statusCode) {
        case 400:
            return 'Invalid request data.'
        case 401:
            return 'Authentication required.'
        case 403:
            return 'Access forbidden.'
        case 404:
            return 'Resource not found.'
        case 409:
            return 'Resource conflict.'
        case 429:
            return 'Too many requests. Please try again later.'
        case 500:
            return 'Internal server error.'
        default:
            return 'An error occurred.'
    }
}

/**
 * Handler for 404 Not Found errors
 * Triggered when no route matches the request
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(404).send({
        error: 'NotFound',
        message: isProd ? 'Resource not found.' : 'Route not found',
        details: []
    })
}
