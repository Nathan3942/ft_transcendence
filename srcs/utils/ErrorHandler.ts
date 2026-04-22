/*fastify a un error handler de base qui renvoie 500 quand il catch une erreur, on peut le custom
mon handler custom: en mode dev details / mode prod pas de details*/

import type { FastifyRequest, FastifyReply } from 'fastify'
import { BaseError } from './appErrors'
import { env, isProd } from '../config/env'

export function errorHandler(
    error: unknown,
    request: FastifyRequest,
    reply: FastifyReply
) {
    // Loguer les erreurs
    request.log.error({
        error,
        url: request.url,
        method: request.method,
        params: request.params,
        query: request.query
    }, 'Error occurred')

    // gerer les erreurs connues (instances de baseError)
    if (error instanceof BaseError) {
        return reply.status(error.statusCode).send({
            error: error.name,
            message: error.message,
            details: isProd ? [] : (error.details ?? [])
        })
    }

    const err = error as any;
    const statusCode =
        typeof err?.statusCode === "number" ? err.statusCode :
        typeof err?.status === "number" ? err.status :
        undefined;

    if (statusCode === 429 || err?.name === "TooManyRequests") {
        const retryAfter =
            err?.headers?.["retry-after"] ??
            err?.headers?.["Retry-After"];

        if (retryAfter) {
            reply.header("retry-after", String(retryAfter));
        }

        return reply.status(429).send({
            error: "TooManyRequests",
            message: isProd
                ? "Too many requests. Please try again later."
                : (err?.message || "Rate limit exceeded."),
            details: []
        })
    }


    // gerer erreur http des plugins fastify ex:jwt
    // ont des statuscode
    if (error instanceof Error && statusCode) {
        return reply.status(statusCode).send({
            error: error.name || "HttpError",
            message: isProd ? getProductionMessage(statusCode) : error.message,
            details: []
        })
    }

    // gerer erreur innatendue interne
    return reply.status(500).send({
        error: 'InternalServerError',
        message: isProd
            ? 'An unexpected error occurred. Please try again later.' //pas details en prod
            : (error instanceof Error ? error.message : 'Unexpected error'),
        details: []
    })
}

/**
pour prod message generiques leak pas d'infos
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
handler pour les 404 not found
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(404).send({
        error: 'NotFound',
        message: isProd ? 'Resource not found.' : 'Route not found',
        details: []
    })
}
