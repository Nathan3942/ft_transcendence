/**
 * User Service
 * Business logic layer for user operations
 * Routes call this service, service calls repositories
 */

import {
    getAll as getAllUsersRepo,
    getById as getUserByIdRepo,
    createUser as createUserRepo,
    getOrCreateByUsername as getOrCreateByUsernameRepo,
    updateUser as updateUserRepo,
    deleteUser as deleteUserRepo
} from '../repository/usersRepository'
import { NotFoundError, BadRequestError } from '../utils/appErrors'
import { PublicUser } from '../models/userModel'

export function getAllUsers(): PublicUser[] {
    const users = getAllUsersRepo()
    if (users.length === 0) {
        throw new NotFoundError('No users in database')
    }
    return users
}

export function getUserById(id: string | number): PublicUser {
    const user = getUserByIdRepo(id)
    if (!user) {
        throw new NotFoundError('User not found')
    }
    return user
}

export async function createUser(username: string, email: string, password_hash: string): Promise<PublicUser> {
    if (!username || !email || !password_hash) {
        throw new BadRequestError('Missing username, email or password_hash')
    }

    try {
        return await createUserRepo({ username, email, password_hash })
    } catch (err: any) {
        if (err.message.includes('already exists')) {
            throw new BadRequestError('User already exists')
        }
        throw err
    }
}

export function getOrCreateUser(username: string): PublicUser {
    if (!username) {
        throw new BadRequestError('Missing username')
    }
    return getOrCreateByUsernameRepo(username)
}

export function updateUser(
    id: string | number,
    fields: { username?: string; display_name?: string; avatar_url?: string }
): PublicUser {
    if (!id || Object.keys(fields).length === 0) {
        throw new BadRequestError('Missing id or fields to update')
    }

    const userExist = getUserByIdRepo(id)
    if (!userExist) {
        throw new NotFoundError('User not found')
    }

    const updated = updateUserRepo(id, fields)
    if (!updated) {
        throw new Error('Failed to update user')
    }

    return getUserByIdRepo(id)!
}

export function deleteUser(id: string | number): { message: string; id: number } {
    const deleted = deleteUserRepo(id)
    if (!deleted) {
        throw new NotFoundError('User not found')
    }

    return {
        message: 'User deleted',
        id: typeof id === 'string' ? parseInt(id) : id
    }
}
