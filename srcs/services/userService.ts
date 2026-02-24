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
import { User } from '../models/userModel'

export function getAllUsers(): User[] {
    const users = getAllUsersRepo() as User[] //execute les fonctions du repo
    if (users.length === 0) {
        throw new NotFoundError('No users in database') //ajoute la logique metier
    }
    return users
}

export function getUserById(id: string | number): User {
    const user = getUserByIdRepo(id) as User | undefined
    if (!user) {
        throw new NotFoundError('User not found')
    }
    return user
}

export async function createUser(username: string): Promise<User> {
    if (!username) {
        throw new BadRequestError('Missing username')
    }

    try {
        const user = await createUserRepo({ username })
        return user
    } catch (err: any) {
        if (err.message.includes('already exists')) {
            throw new BadRequestError('User already exists')
        }
        throw err
    }
}

export function getOrCreateUser(username: string): User {
    if (!username) {
        throw new BadRequestError('Missing username')
    }
    return getOrCreateByUsernameRepo(username)
}

export function updateUser(id: string | number, username: string): { id: number; username: string } {
    if (!id || !username) {
        throw new BadRequestError('Missing id or username')
    }

    const userExist = getUserByIdRepo(id)
    if (!userExist) {
        throw new NotFoundError('User not found')
    }

    const updated = updateUserRepo(id, username)
    if (!updated) {
        throw new Error('Failed to update user')
    }

    return {
        id: typeof id === 'string' ? parseInt(id) : id,
        username
    }
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
