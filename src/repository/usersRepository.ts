/* ce fichier permet de centraliser toutes les methodes
qu'on peut utilser sur users
exemple getById, getAll, create etc */


import { queryAll, queryOne, queryExecute } from '../database/queryWrapper'
import { User } from '../models/userModel' //importer l'interface user

// Retourne tous les utilisateurs de la table users
export function getAll() {
	return queryAll('SELECT * FROM users')
}

export function getById(id: string | number){
    return queryOne('SELECT * FROM users WHERE id = ?', [id])
}


// Création d'un utilisateur avec gestion de l'unicité
export async function createUser({ username }: { username: string }): Promise<User> {
    try {
        const result = await queryExecute(
            'INSERT INTO users (username) VALUES (?)',
            [username]
        );
        return {
            id: result.lastInsertRowid as number,
            username,
        };
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error('user already exists');
        }
        throw err;
    }
}
