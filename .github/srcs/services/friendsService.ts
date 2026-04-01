/**
 * Friends Service
 * Business logic : validation, orchestration entre repository et routes
 */

import {
    sendRequest as sendRequestRepo,
    getFriendshipBetween,
    acceptRequest as acceptRequestRepo,
    removeFriendship as removeFriendshipRepo,
    getFriendsOf as getFriendsOfRepo,
    getPendingRequestsFor as getPendingRequestsForRepo
} from '../repository/friendsRepository'
import { getById as getUserByIdRepo } from '../repository/usersRepository'
import { BadRequestError, NotFoundError, ForbiddenError, ConflictError } from '../utils/appErrors'
import { Friendship, FriendEntry, PendingRequest } from '../models/friendModel'

const DEFAULT_AVATAR = '/uploads/avatars/default.svg'

function withDefaultAvatarFriend(f: FriendEntry): FriendEntry {
    return { ...f, avatar_url: f.avatar_url ?? DEFAULT_AVATAR }
}

// POST /users/:id/friends — :id envoie une demande à addresseeId
export function sendFriendRequest(requesterId: number, addresseeId: number): Friendship {
    if (requesterId === addresseeId) {
        throw new BadRequestError('You cannot add yourself as a friend')
    }

    const addressee = getUserByIdRepo(addresseeId)
    if (!addressee) {
        throw new NotFoundError('User not found')
    }

    const existing = getFriendshipBetween(requesterId, addresseeId)
    if (existing) {
        if (existing.status === 'pending') {
            throw new ConflictError('Friend request already pending')
        }
        if (existing.status === 'accepted') {
            throw new ConflictError('Already friends')
        }
    }

    return sendRequestRepo(requesterId, addresseeId)
}

// PATCH /users/:id/friends/:friendId — :id accepte ou refuse la demande de :friendId
export function respondToRequest(
    addresseeId: number,
    requesterId: number,
    action: 'accept' | 'reject'
): { message: string } {
    const friendship = getFriendshipBetween(requesterId, addresseeId)

    if (!friendship || friendship.status !== 'pending') {
        throw new NotFoundError('No pending friend request found')
    }

    // Seul le destinataire peut accepter/refuser
    if (friendship.addressee_id !== addresseeId) {
        throw new ForbiddenError('You can only respond to requests sent to you')
    }

    if (action === 'accept') {
        acceptRequestRepo(requesterId, addresseeId)
        return { message: 'Friend request accepted' }
    } else {
        removeFriendshipRepo(requesterId, addresseeId)
        return { message: 'Friend request rejected' }
    }
}

// GET /users/:id/friends — liste des amis acceptés avec statut online
export function getFriends(userId: number): FriendEntry[] {
    const user = getUserByIdRepo(userId)
    if (!user) {
        throw new NotFoundError('User not found')
    }
    return getFriendsOfRepo(userId).map(withDefaultAvatarFriend)
}

// GET /users/:id/friends/requests — demandes entrantes en attente
export function getPendingRequests(userId: number): PendingRequest[] {
    const user = getUserByIdRepo(userId)
    if (!user) {
        throw new NotFoundError('User not found')
    }
    return getPendingRequestsForRepo(userId)
}

// DELETE /users/:id/friends/:friendId — supprime la relation
export function removeFriend(userId: number, friendId: number): { message: string } {
    const friendship = getFriendshipBetween(userId, friendId)
    if (!friendship) {
        throw new NotFoundError('Friendship not found')
    }

    removeFriendshipRepo(userId, friendId)
    return { message: 'Friend removed' }
}
