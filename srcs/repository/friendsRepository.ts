/* Requêtes DB pour la table friends
   Structure : requester_id → addressee_id, status = pending | accepted | blocked
*/

import { queryAll, queryOne, queryExecute } from '../database/queryWrapper'
import { Friendship, FriendEntry, PendingRequest } from '../models/friendModel'
import { ConflictError } from '../utils/appErrors'

// Envoie une demande (crée une ligne pending)
export function sendRequest(requesterId: number, addresseeId: number): Friendship {
    try {
        const result = queryExecute(
            `INSERT INTO friends (requester_id, addressee_id, status) VALUES (?, ?, 'pending')`,
            [requesterId, addresseeId]
        )
        return queryOne(
            'SELECT * FROM friends WHERE id = ?',
            [result.lastInsertRowid]
        ) as Friendship
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new ConflictError('Friend request already exists')
        }
        throw err
    }
}

// Cherche une relation entre deux users (peu importe la direction)
export function getFriendshipBetween(userId1: number, userId2: number): Friendship | undefined {
    return queryOne(
        `SELECT * FROM friends
         WHERE (requester_id = ? AND addressee_id = ?)
            OR (requester_id = ? AND addressee_id = ?)`,
        [userId1, userId2, userId2, userId1]
    ) as Friendship | undefined
}

// Accepte une demande — vérifie que addresseeId est bien le destinataire
export function acceptRequest(requesterId: number, addresseeId: number): boolean {
    const result = queryExecute(
        `UPDATE friends SET status = 'accepted'
         WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'`,
        [requesterId, addresseeId]
    )
    return result.changes > 0
}

// Supprime une relation (peu importe la direction)
export function removeFriendship(userId1: number, userId2: number): boolean {
    const result = queryExecute(
        `DELETE FROM friends
         WHERE (requester_id = ? AND addressee_id = ?)
            OR (requester_id = ? AND addressee_id = ?)`,
        [userId1, userId2, userId2, userId1]
    )
    return result.changes > 0
}

// Liste les amis acceptés d'un user avec leur statut online
// UNION : le user peut être requester OU addressee
export function getFriendsOf(userId: number): FriendEntry[] {
    return queryAll(
        `SELECT f.id AS friendship_id, u.id, u.username, u.display_name, u.avatar_url, u.is_online
         FROM friends f
         JOIN users u ON u.id = f.addressee_id
         WHERE f.requester_id = ? AND f.status = 'accepted'
         UNION
         SELECT f.id AS friendship_id, u.id, u.username, u.display_name, u.avatar_url, u.is_online
         FROM friends f
         JOIN users u ON u.id = f.requester_id
         WHERE f.addressee_id = ? AND f.status = 'accepted'`,
        [userId, userId]
    ) as FriendEntry[]
}

// Liste les demandes entrantes en attente pour un user
export function getPendingRequestsFor(userId: number): PendingRequest[] {
    return queryAll(
        `SELECT f.id AS friendship_id, f.requester_id, u.username, u.display_name, u.avatar_url, f.created_at
         FROM friends f
         JOIN users u ON u.id = f.requester_id
         WHERE f.addressee_id = ? AND f.status = 'pending'`,
        [userId]
    ) as PendingRequest[]
}
