export interface standardProps {
	id?: string;
}

export interface buttonProps extends standardProps {
	f?: () => void;
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

export interface loginResponse {
	accessToken: string;
	refreshToken?: string;
	expiresAt: number;
}