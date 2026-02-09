/* Match models - defines TypeScript interfaces for matches and match players */

export type MatchStatus = 'pending' | 'in_progress' | 'finished';

export interface Match {
  id: number;
  tournamentId: number | null;
  round: number | null;
  status: MatchStatus;
  winnerId: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface MatchPlayer {
  id: number;
  matchId: number;
  userId: number;
  score: number | null;
}

export interface MatchWithPlayers extends Match {
  players: {
    userId: number;
    score: number | null;
  }[];
}
