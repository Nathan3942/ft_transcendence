/* Stats models - defines TypeScript interfaces for user stats and leaderboard */

export interface UserStats {
    userId: number;
    username: string;
    totalMatches: number;
    wins: number;
    losses: number;
    winrate: number;
    tournamentsWon: number;
}

export interface MatchHistory {
    matchId: number;
    opponentId: number | null;
    opponentName: string | null;
    userScore: number | null;
    opponentScore: number | null;
    won: boolean;
    finishedAt: string | null;
}

export interface LeaderboardEntry {
    userId: number;
    username: string;
    wins: number;
    losses: number;
    totalMatches: number;
    winrate: number;
}
