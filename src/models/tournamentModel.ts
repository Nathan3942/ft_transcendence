/* Tournament models - defines TypeScript interfaces for tournaments and related entities */

export interface Tournament {
  id: number;
  name: string;
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
