export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface Friendship {
    id: number
    requester_id: number
    addressee_id: number
    status: FriendshipStatus
    created_at: string
}

// Amis avec leurs infos + statut en ligne
export interface FriendEntry {
    friendship_id: number
    id: number
    username: string
    display_name: string | null
    avatar_url: string | null
    is_online: number
}

// Demandes d'amis entrantes avec infos du demandeur
export interface PendingRequest {
    friendship_id: number
    requester_id: number
    username: string
    display_name: string | null
    avatar_url: string | null
    created_at: string
}
