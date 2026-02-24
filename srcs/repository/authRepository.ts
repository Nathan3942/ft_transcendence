/* Requetes DB specifiques a l'authentification
   Seul endroit qui expose password_hash — usage interne uniquement */

import { queryOne } from '../database/queryWrapper'
import { User } from '../models/userModel'

// Retourne le user complet avec password_hash — pour bcrypt.compare uniquement
export function getUserWithPasswordByEmail(email: string): User | undefined {
    return queryOne('SELECT * FROM users WHERE email = ?', [email]) as User | undefined
}

export function getUserWithPasswordByUsername(username: string): User | undefined {
    return queryOne('SELECT * FROM users WHERE username = ?', [username]) as User | undefined
}
