/* Tournament models - defines TypeScript interfaces for tournaments and related entities */

export type TournamentStatus = 'open' | 'in_progress' | 'finished';

export interface Tournament {
  id: number;
  name: string;
  status: TournamentStatus;
  winnerId: number | null;
  createdAt: string;
}

export interface TournamentPlayer {
  id: number;
  tournamentId: number;
  userId: number;
  joinedAt: string;
}

export interface TournamentWithPlayers extends Tournament {
  players: number[];
}
