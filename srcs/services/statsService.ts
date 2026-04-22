/**
 * Stats Service
 * Business logic for user stats, match history, and leaderboard
 */

import {
    getUserStats as getUserStatsRepo,
    getUserMatchHistory as getUserMatchHistoryRepo,
    getLeaderboard as getLeaderboardRepo
} from '../repository/statsRepository'
import { getById as getUserById } from '../repository/usersRepository'
import { NotFoundError, BadRequestError } from '../utils/appErrors'

export function getUserStats(userId: string | number) {
    const numId = typeof userId === 'string' ? parseInt(userId) : userId
    if (isNaN(numId) || numId <= 0) {
        throw new BadRequestError('userId must be a positive integer')
    }

    const user = getUserById(numId)
    if (!user) {
        throw new NotFoundError('User not found')
    }

    const stats = getUserStatsRepo(numId)
    if (!stats) {
        throw new NotFoundError('User not found')
    }

    return stats
}

export function getUserMatchHistory(userId: string | number) {
    const numId = typeof userId === 'string' ? parseInt(userId) : userId
    if (isNaN(numId) || numId <= 0) {
        throw new BadRequestError('userId must be a positive integer')
    }

    const user = getUserById(numId)
    if (!user) {
        throw new NotFoundError('User not found')
    }

    return getUserMatchHistoryRepo(numId)
}

export function getLeaderboard(limit: number = 20) {
    if (limit <= 0 || limit > 100) {
        throw new BadRequestError('limit must be between 1 and 100')
    }

    return getLeaderboardRepo(limit)
}
