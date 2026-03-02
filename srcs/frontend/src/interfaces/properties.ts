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
	iconAlt?: string;
	iconBClass?: string;
	type?: "button" | "reset" | "submit";
}

export interface loginRequest {
	username: string;
	password: string;
}

export interface Route {
	path: string;
	component: () => HTMLDivElement | Promise<HTMLDivElement>;
	guarded?: Guard[];
}