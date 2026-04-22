/* ce fichier permet de centraliser toutes les requetes a la database qui concernent les users*/

import { queryAll, queryOne, queryExecute } from '../database/queryWrapper'
import { User, PublicUser } from '../models/userModel'
import { ConflictError } from '../utils/appErrors'

const PUBLIC_FIELDS = `
    id, username, email, display_name, avatar_url, is_online, created_at
`

export function getAll(): PublicUser[] {
    return queryAll(`SELECT ${PUBLIC_FIELDS} FROM users WHERE deleted_at IS NULL`) as PublicUser[]
}

export function getById(id: string | number): PublicUser | undefined {
    return queryOne(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [id]) as PublicUser | undefined
}

export function getByIdWithHash(id: string | number): User | undefined {
    return queryOne(`SELECT * FROM users WHERE id = ? AND deleted_at IS NULL`, [id]) as User | undefined
}

export function getByUsername(username: string): PublicUser | undefined {
    return queryOne(`SELECT ${PUBLIC_FIELDS} FROM users WHERE username = ? AND deleted_at IS NULL`, [username]) as PublicUser | undefined
}

// Inclut password_hash — usage interne uniquement (auth)
export function getByEmail(email: string): User | undefined {
    return queryOne(`SELECT * FROM users WHERE email = ?`, [email]) as User | undefined
}

export function getOrCreateByUsername(username: string): PublicUser {
    const existing = getByUsername(username)
    if (existing) return existing
    const result = queryExecute(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, `${username}@local`, '']
    )
    return {
        id: result.lastInsertRowid as number,
        username,
        email: `${username}@local`,
        display_name: null,
        avatar_url: null,
        is_online: 0,
        created_at: new Date().toISOString()
    }
}

export async function createUser({ username, email, password_hash }: {
    username: string;
    email: string;
    password_hash: string;
}): Promise<PublicUser> {
    try {
        const result = await queryExecute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        )
        return {
            id: result.lastInsertRowid as number,
            username,
            email,
            display_name: null,
            avatar_url: null,
            is_online: 0,
            created_at: new Date().toISOString()
        }
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new ConflictError('Username or email already exists')
        }
        throw err
    }
}

export function updateUser(id: string | number, fields: Partial<Pick<User, 'username' | 'email' | 'display_name' | 'avatar_url'>>): boolean {
    const entries = Object.entries(fields).filter(([, v]) => v !== undefined)
    if (entries.length === 0) return false
    const setClauses = entries.map(([k]) => `${k} = ?`).join(', ')
    const values = entries.map(([, v]) => v)
    try {
        const result = queryExecute(
            `UPDATE users SET ${setClauses} WHERE id = ?`,
            [...values, id]
        )
        return result.changes > 0
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new ConflictError('Display name already taken')
        }
        throw err
    }
}

export function deleteUser(id: string | number): boolean {
    const result = queryExecute(
        `UPDATE users SET
            deleted_at    = CURRENT_TIMESTAMP,
            username      = '[deleted_' || id || ']',
            email         = '[deleted_' || id || ']',
            password_hash = '',
            display_name  = NULL,
            avatar_url    = NULL,
            is_online     = 0
        WHERE id = ? AND deleted_at IS NULL`,
        [id]
    )
    return result.changes > 0
}

export function setOnlineStatus(id: string | number, isOnline: boolean): void {
    queryExecute('UPDATE users SET is_online = ? WHERE id = ?', [isOnline ? 1 : 0, id])
}
