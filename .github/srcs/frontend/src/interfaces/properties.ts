import type { Guard } from "../handler/routeHandler";

export interface standardProps {
	id?: string;
}

export interface buttonProps extends standardProps {
	f?: () => void | Promise<void>;
	href?: string;
	extraClasses?: string;
	buttonText?: string;
	icon?: string;
	iconId?: string;
	iconAlt?: string;
	iconBClass?: string;
	type?: "button" | "reset" | "submit";
}

export interface loginRequest {
	email: string;
	password: string;
}

export interface registrationRequest {
	email: string;
	username: string;
	password: string;
}

export interface loginResponse {
	data: user;
}

export interface user {
	id: number;
	username: string;
	display_name: string;
	email?: string;
	avatar_url: string | null;
	is_online: boolean;
	created_at?: string;
}

export interface APIErrMsg {
	error: string;
	message: string;
	details?: unknown;
}

export interface Route {
	path: string;
	component: () => HTMLDivElement | Promise<HTMLDivElement>;
	init?: () => void | Promise<void>;
	guarded?: Guard[];
}

export interface userStatsResponse {
	data: {
		userId: number;
		username: string;
		totalMatches: number;
		wins: number;
		losses: number;
		winrate: number;
		tournamentsWon: number;
	};
}

export interface userMatchHistoryResponse {
	data: Array<{
		matchId: number;
		opponentId: number;
		opponentName: string;
		userScore: number;
		opponentScore: number;
		won: boolean;
		finishedAt: string;
	}>;
}

export interface FriendResponse {
	data: Friend[]
}

export interface Friend {
	friendship_id: number,
	id: number,
	username: string,
	display_name: string,
	avatar_url: string,
	is_online: boolean
}

export interface AddFriendRequest {
	friendId: number
}

export interface PatchFriendRequest {
	action: "accept" | "reject"
}

export interface FriendRequestResponse {
	data: FriendRequest[] 
}

export interface FriendRequest {
	friendship_id: number,
	requester_id: number,
	username: string,
	display_name: string,
	avatar_url: string,
	created_at: string
}
