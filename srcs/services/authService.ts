/* Logique metier pour l'authentification
   register → hash password → insert user
   login    → compare password → signe JWT
   logout   → met is_online a 0 */

import bcrypt from 'bcryptjs'
import { createUser } from '../repository/usersRepository'
import { getUserWithPasswordByEmail } from '../repository/authRepository'
import { setOnlineStatus } from '../repository/usersRepository'
import { UnauthorizedError } from '../utils/appErrors'
import { validateBody, registerSchema, loginSchema } from '../utils/validation'
import { PublicUser } from '../models/userModel'

const SALT_ROUNDS = 12

export async function register(
    username: string,
    email: string,
    password: string
): Promise<{ user: PublicUser; payload: { id: number; username: string } }> {
    validateBody(registerSchema, { username, email, password })

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await createUser({ username, email, password_hash })

    setOnlineStatus(user.id, true)

    const payload = { id: user.id, username: user.username }
    const publicUser: PublicUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        is_online: 1,
        created_at: user.created_at,
    }
    return { user: publicUser, payload }
}

export async function login(
    email: string,
    password: string
): Promise<{ user: PublicUser; payload: { id: number; username: string } }> {
    validateBody(loginSchema, { email, password })

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
    const publicUser: PublicUser = {
        id: userWithHash.id,
        username: userWithHash.username,
        email: userWithHash.email,
        display_name: userWithHash.display_name,
        avatar_url: userWithHash.avatar_url,
        is_online: 1,
        created_at: userWithHash.created_at,
    }
    return { user: publicUser, payload }
}

export function logout(userId: number): void {
    setOnlineStatus(userId, false)
}
