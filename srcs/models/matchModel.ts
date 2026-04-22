/* Match models - defines TypeScript interfaces for matches and match players */

export type MatchStatus = 'pending' | 'in_progress' | 'finished';

export type ModeStatus = '1v1' | '2v2' | '3p' | '4p' | 'ai';

export interface Match {
  id: number;
  tournamentId: number | null;
  round: number | null;
  status: MatchStatus;
  mode: ModeStatus;
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
