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
	data: {
		user: user;
	};
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