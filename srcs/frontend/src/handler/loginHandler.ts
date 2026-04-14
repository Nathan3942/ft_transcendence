import { renderError, renderMessage } from "../components/popup/popup";
import { setItem } from "../helpers/localStoragehelper";
import type { authResponse, loginRequest, loginResponse, registrationRequest } from "../interfaces/properties";
import { connectGlobalWS } from "../main";

export const API_BASE = `/api/v1`;

export async function loginHandler(payload: loginRequest): Promise<number> {
	const resp = await fetch(`${API_BASE}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload),
		credentials: "include"
	});

	if (!resp.ok) {
		const err = await resp.text();

		if (resp.status === 400) {
			return 400;
		} else if (resp.status === 401) {
			return 401;
		} else if (resp.status == 404 && resp.text.length == 0)
			renderMessage("Login failed: You appear to be offline.");
		console.error(`Login failed: ${resp.status}: ${err}`);
		return resp.status;
	}

	const respJson = await resp.json() as loginResponse;
	console.error(respJson);
	const respUser = respJson.data.user;

	setItem<number>("id", respUser.id);
	setItem<string>("username", respUser.username);
	setItem<string>("display_name", respUser.display_name);
	if (respUser.email)
		setItem<string>("email", respUser.email);
	setItem<string | null>("avatar_url", respUser.avatar_url);
	setItem<boolean>("is_online", respUser.is_online);
	if (respUser.created_at)
		setItem<string>("created_at", respUser.created_at);

	setItem<boolean>("loggedIn", true);
	connectGlobalWS();
	return 200;
}

export async function registerHandler(payload: registrationRequest): Promise<number> {
	const resp = await fetch(`${API_BASE}/auth/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload),
		credentials: "include"
	});

	if (!resp.ok) {
		const status = resp.status;
		const err = await resp.text();
		if (status === 400) {
			return 400;
		} else if (status === 409) {
			return 409;
		} else if (status == 404 && resp.text.length == 0)
			renderMessage("Registration failed: You appear to be offline.");
		console.error(`Registration failed: ${status}: ${err}`);
		return status;
	}

	const respJson = await resp.json() as loginResponse;
	const respUser = respJson.data.user;

	setItem<number>("id", respUser.id);
	setItem<string>("username", respUser.username);
	setItem<string>("display_name", respUser.display_name);
	if (respUser.email)
		setItem<string>("email", respUser.email);
	setItem<string | null>("avatar_url", respUser.avatar_url);
	setItem<boolean>("is_online", respUser.is_online);
	if (respUser.created_at)
		setItem<string>("created_at", respUser.created_at);

	setItem<boolean>("loggedIn", true);
	connectGlobalWS();
	return 200;
}

export function clearLoginInfo() {
	setItem<null>("id", null);
	setItem<null>("username", null);
	setItem<null>("display_name", null);
	setItem<null>("email", null);
	setItem<null>("avatar_url", null);
	setItem<boolean>("is_online", false);
}

export async function logoutHandler() {
	try {
		const resp = await fetch(`${API_BASE}/auth/logout`, {
			method: "POST",
			credentials: "include"
		})

		if (resp.status === 401) {
			renderMessage("You are not logged in");
			redirectToLogin();
		}
		
		if (!resp.ok) {
			const err = await resp.text();
			renderError(`Logout failed: ${resp.status}: ${err}`);
			throw new Error(`Logout failed: ${resp.status}: ${err}`);
		}
		// stopPresence();
		clearLoginInfo();

		redirectToLogin();
	} catch (err) {
		console.warn(err);
	}
}

export function redirectToLogin(): void {
	setItem<boolean>("loggedIn", false);
	window.location.href = "/login";
}

export async function fetchProtected<T = unknown>(endpoint: string, opts: RequestInit = {}): Promise<T | null | string> {
	const resp = await fetch(`${API_BASE}${endpoint}`, {
		...opts,
		credentials: "include"
	});

	if (resp.status === 401) {
		console.warn(`Error 401: ${resp.text()}`);
		renderMessage("You appear to be logged out, please try to log in again");
		redirectToLogin();
		return (null);
	}

	if (!resp.ok) {
		console.error("Error while fetching resource:", await resp.text())
		return null;
	}
	return (await resp.json() as T);
}

export async function authenticate(): Promise<boolean | string> {
	try {
		const resp = await fetch(`${API_BASE}/auth/me`, {
			method: "GET",
			credentials: "include",
			cache: "reload"
		});

		if (resp.status === 200) {
			
			const respJson = await resp.json() as authResponse;
			const respUser = respJson.data;

			setItem<number>("id", respUser.id);
			setItem<string>("username", respUser.username);
			setItem<string>("display_name", respUser.display_name);
			if (respUser.email)
				setItem<string>("email", respUser.email);
			setItem<string | null>("avatar_url", respUser.avatar_url);
			setItem<boolean>("is_online", respUser.is_online);
			if (respUser.created_at)
				setItem<string>("created_at", respUser.created_at);

			setItem<boolean>("loggedIn", true);
			connectGlobalWS();

			return true;
		}
		if (resp.status === 401) {
			const text = await resp.text();
			console.warn(`Error 401: ${text}`);

			renderMessage("You appear to be logged out, please try to log in again");
			redirectToLogin();
			return (false);
		}

		const text = await resp.text(); // ✅ UNE FOIS

		if (resp.status === 404 && text.length === 0) {
			renderMessage("You appear to be offline. Some features may be unavailable");
			return "offline";
		}

		if (resp.status === 404) {
			renderMessage(`Error: ${text}`);
			redirectToLogin();
			return false;
		}

		console.warn("Unexpected auth/me status:", resp.status);
		return resp.status.toString();
	}
	catch (err) {
		console.error ("Error while checking auth:", err);
		return "Error while checking auth";
	}
}