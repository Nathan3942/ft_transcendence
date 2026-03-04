/* Logique metier pour l'authentification
   register → hash password → insert user
   login    → compare password → signe JWT
   logout   → met is_online a 0 */

import bcrypt from 'bcryptjs'
import { createUser } from '../repository/usersRepository'
import { getUserWithPasswordByEmail } from '../repository/authRepository'
import { setOnlineStatus } from '../repository/usersRepository'
import { BadRequestError, UnauthorizedError } from '../utils/appErrors'
import { PublicUser } from '../models/userModel'

const SALT_ROUNDS = 12

export async function register(
    username: string,
    email: string,
    password: string
): Promise<{ user: PublicUser; payload: { id: number; username: string } }> {
    if (!username || !email || !password) {
        throw new BadRequestError('Missing username, email or password')
    }
    if (password.length < 8) {
        throw new BadRequestError('Password must be at least 8 characters')
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await createUser({ username, email, password_hash })

    setOnlineStatus(user.id, true)

    const payload = { id: user.id, username: user.username }
    return { user: { ...user, is_online: 1 }, payload }
}

export async function login(
    email: string,
    password: string
): Promise<{ user: PublicUser; payload: { id: number; username: string } }> {
    if (!email || !password) {
        throw new BadRequestError('Missing email or password')
    }

    const userWithHash = getUserWithPasswordByEmail(email)
    // Message volontairement vague pour ne pas révéler si l'email existe
    if (!userWithHash) {
        throw new UnauthorizedError('Invalid credentials')
    }

    const passwordMatch = await bcrypt.compare(password, userWithHash.password_hash)
    if (!passwordMatch) {
        throw new UnauthorizedError('Invalid credentials')
    }

    setOnlineStatus(userWithHash.id, true)

    // Payload du JWT — seulement ce qui est nécessaire
    const payload = { id: userWithHash.id, username: userWithHash.username }

    // PublicUser sans password_hash, avec is_online à jour
    const { password_hash: _, ...publicUser } = { ...userWithHash, is_online: 1 }

    return { user: publicUser as PublicUser, payload }
}

export function logout(userId: number): void {
    setOnlineStatus(userId, false)
}
