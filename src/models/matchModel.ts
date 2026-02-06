/* Match models - defines TypeScript interfaces for matches and match players */

export interface Match {
  id: number;
  tournamentId: number;
  round: number;
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
