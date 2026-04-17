import { z, ZodSchema } from 'zod'
import { BadRequestError } from './appErrors'

/**
 * Validates request body against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate (request.body)
 * @returns Parsed and validated data
 * @throws BadRequestError if validation fails
 */
export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data)
    if (!result.success) {
        const errorMessages = result.error.issues.map((e: any) => e.message).join(', ')
        throw new BadRequestError(`Invalid request body: ${errorMessages}`)
    }
    return result.data
}

/**
 * Validates query parameters against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate (request.query)
 * @returns Parsed and validated data
 * @throws BadRequestError if validation fails
 */
export function validateQuery<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data)
    if (!result.success) {
        const errorMessages = result.error.issues.map((e: any) => e.message).join(', ')
        throw new BadRequestError(`Invalid query parameters: ${errorMessages}`)
    }
    return result.data
}

/**
 * Validates route parameters against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate (request.params)
 * @returns Parsed and validated data
 * @throws BadRequestError if validation fails
 */
export function validateParams<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data)
    if (!result.success) {
        const errorMessages = result.error.issues.map((e: any) => e.message).join(', ')
        throw new BadRequestError(`Invalid route parameters: ${errorMessages}`)
    }
    return result.data
}

// ========================
// Common Reusable Schemas
// ========================

/**
 * Validates ID parameter as a positive integer string
 * Usage: validateParams(idParamSchema, request.params)
 */
export const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number)
})

/**
 * Validates provider route parameters (provider and providerUserId)
 * Usage: validateParams(providerParamSchema, request.params)
 */
export const providerParamSchema = z.object({
    provider: z.string().min(1, 'Provider is required'),
    providerUserId: z.string().min(1, 'Provider user ID is required')
})

/**
 * Validates pagination query parameters with defaults
 * Usage: validateQuery(paginationSchema, request.query)
 */
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
})

export const registerSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters')
})

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
})

/**
 * Schema for creating a user
 */
export const createUserSchema = z.object({
    provider: z.string().min(1, 'Provider is required'),
    providerUserId: z.string().min(1, 'Provider user ID is required'),
    displayName: z.string().min(1, 'Display name is required'),
    email: z.string().email('Invalid email format').optional().nullable(),
    avatarUrl: z.string().url('Invalid URL format').optional().nullable()
})

/**
 * Schema for updating a user
 */
export const updateUserSchema = z.object({
    email: z.string().email('Invalid email format').optional().nullable(),
    displayName: z.string().min(1, 'Display name cannot be empty').optional(),
    avatarUrl: z.string().url('Invalid URL format').optional().nullable()
})
