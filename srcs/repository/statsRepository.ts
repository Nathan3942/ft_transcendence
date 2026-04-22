/* centralise toutes les requetes stats/leaderboard */

import { queryOne, queryAll } from '../database/queryWrapper'
import { UserStats, MatchHistory, LeaderboardEntry } from '../models/statsModel'

export function getUserStats(userId: number): UserStats | null {
    const row = queryOne(`
        SELECT
            u.id as userId,
            u.username,
            COUNT(mp.id) as totalMatches,
            SUM(CASE WHEN m.winner_id = u.id THEN 1 ELSE 0 END) as wins,
            SUM(CASE WHEN m.id IS NOT NULL AND (m.winner_id IS NULL OR m.winner_id != u.id) THEN 1 ELSE 0 END) as losses
        FROM users u
        LEFT JOIN match_player mp ON mp.user_id = u.id
        LEFT JOIN matches m ON mp.match_id = m.id AND m.status = 'finished'
        WHERE u.id = ?
        GROUP BY u.id
    `, [userId]) as any

    if (!row) return null

    const tournamentsWon = queryOne(`
        SELECT COUNT(*) as count FROM tournaments WHERE winner_id = ?
    `, [userId]) as any

    return {
        userId: row.userId,
        username: row.username,
        totalMatches: row.totalMatches || 0,
        wins: row.wins || 0,
        losses: row.losses || 0,
        winrate: row.totalMatches > 0 ? Math.round((row.wins / row.totalMatches) * 100) : 0,
        tournamentsWon: tournamentsWon?.count || 0
    }
}

export function getUserMatchHistory(userId: number): MatchHistory[] {
    const rows = queryAll(`
        SELECT
            m.id as matchId,
            m.winner_id as winnerId,
            m.finished_at as finishedAt,
            m.ai_score as aiScore,
            m.mode as mode,
            mp_self.score as userScore,
            mp_opp.user_id as opponentId,
            mp_opp.score as opponentScore,
            u_opp.username as opponentName
        FROM match_player mp_self
        JOIN matches m ON mp_self.match_id = m.id
        LEFT JOIN match_player mp_opp ON mp_opp.match_id = m.id AND mp_opp.user_id != ?
        LEFT JOIN users u_opp ON mp_opp.user_id = u_opp.id
        WHERE mp_self.user_id = ? AND m.status = 'finished'
        ORDER BY m.finished_at DESC
    `, [userId, userId]) as any[]

    return rows.map((r: any) => ({
        matchId: r.matchId,
        opponentId: r.opponentId ?? null,
        opponentName: r.opponentName ?? null,
        userScore: r.userScore ?? null,
        opponentScore: r.opponentScore ?? r.aiScore ?? null,
        won: r.winnerId === userId,
        finishedAt: r.finishedAt ?? null,
        mode: r.mode ?? null
    }))
}

export function getLeaderboard(limit: number = 20): LeaderboardEntry[] {
    const rows = queryAll(`
        SELECT
            u.id as userId,
            u.username,
            COUNT(mp.id) as totalMatches,
            SUM(CASE WHEN m.winner_id = u.id THEN 1 ELSE 0 END) as wins,
            SUM(CASE WHEN m.id IS NOT NULL AND (m.winner_id IS NULL OR m.winner_id != u.id) THEN 1 ELSE 0 END) as losses
        FROM users u
        JOIN match_player mp ON mp.user_id = u.id
        JOIN matches m ON mp.match_id = m.id AND m.status = 'finished'
        GROUP BY u.id
        HAVING totalMatches > 0
        ORDER BY wins DESC, totalMatches ASC
        LIMIT ?
    `, [limit]) as any[]

    return rows.map((r: any) => ({
        userId: r.userId,
        username: r.username,
        wins: r.wins || 0,
        losses: r.losses || 0,
        totalMatches: r.totalMatches || 0,
        winrate: r.totalMatches > 0 ? Math.round((r.wins / r.totalMatches) * 100) : 0
    }))
}
