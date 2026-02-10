/**
 * User Service
 * Business logic layer for user operations
 * Routes call this service, service calls repositories
 */

import {
    getAll as getAllUsersRepo,
    getById as getUserByIdRepo,
    createUser as createUserRepo,
    getOrCreateByUsername as getOrCreateByUsernameRepo
} from '../repository/usersRepository'
import { queryOne, queryExecute } from '../database/queryWrapper'
import { NotFoundError, BadRequestError } from '../utils/appErrors'
import { User } from '../models/userModel'

/**
 * Get all users from database
 * @returns Array of users
 * @throws NotFoundError if no users exist
 */
export function getAllUsers(): User[] {
    const users = getAllUsersRepo() as User[] //execute les fonctions du repo
    if (users.length === 0) {
        throw new NotFoundError('No users in database') //ajoute la logique metier
    }
    return users
}

/**
 * Get user by ID
 * @param id - User ID
 * @returns User object
 * @throws NotFoundError if user doesn't exist
 */
export function getUserById(id: string | number): User {
    const user = getUserByIdRepo(id) as User | undefined
    if (!user) {
        throw new NotFoundError('User not found')
    }
    return user
}

/**
 * Create a new user
 * @param username - Username for new user
 * @returns Created user object
 * @throws BadRequestError if username is missing or user already exists
 */
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

/**
 * Crée un user ou retourne le user existant si le username existe déjà
 * Utilisé par le frontend local pour obtenir un user ID sans erreur de doublon
 */
export function getOrCreateUser(username: string): User {
    if (!username) {
        throw new BadRequestError('Missing username')
    }
    return getOrCreateByUsernameRepo(username)
}

/**
 * Update user username
 * @param id - User ID
 * @param username - New username
 * @returns Updated user object
 * @throws BadRequestError if id or username is missing
 * @throws NotFoundError if user doesn't exist
 */
export function updateUser(id: string | number, username: string): { id: number; username: string } {
    if (!id || !username) {
        throw new BadRequestError('Missing id or username')
    }

    // Check user exists
    const user = queryOne('SELECT * FROM users WHERE id = ?', [id])
    if (!user) {
        throw new NotFoundError('User not found')
    }

    // Update username
    const result = queryExecute('UPDATE users SET username = ? WHERE id = ?', [username, id])
    if (result.changes === 0) {
        throw new Error('Failed to update user')
    }

    return {
        id: typeof id === 'string' ? parseInt(id) : id,
        username
    }
}

/**
 * Delete user by ID
 * @param id - User ID
 * @returns Success message with deleted user ID
 * @throws NotFoundError if user doesn't exist
 */
export function deleteUser(id: string | number): { message: string; id: number } {
    const result = queryExecute('DELETE FROM users WHERE id = ?', [id])
    if (result.changes === 0) {
        throw new NotFoundError('User not found')
    }

    return {
        message: 'User deleted',
        id: typeof id === 'string' ? parseInt(id) : id
    }
}
