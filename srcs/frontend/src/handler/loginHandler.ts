import { renderError, renderMessage } from "../components/popup/popup";
import { setItem } from "../helpers/localStoragehelper";
import type { loginRequest, loginResponse, registrationRequest } from "../interfaces/properties";

export const API_BASE = "/api/v1";

export async function loginHandler(payload: loginRequest): Promise<void> {
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
		if (resp.status == 404 && resp.text.length == 0)
			renderMessage("Login failed: You appear to be offline.");
		throw new Error(`Login failed: ${resp.status}: ${err}`);
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
}

export async function registerHandler(payload: registrationRequest): Promise<void> {
	const resp = await fetch(`${API_BASE}/auth/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload),
		credentials: "include"
	});

	if (!resp.ok) {
		const err = await resp.text();
		if (resp.status == 404 && resp.text.length == 0)
			renderMessage("Registration failed: You appear to be offline.");
		throw new Error(`Registration failed: ${resp.status}: ${err}`);
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
}

export async function logoutHandler() {
	try {
		const resp = await fetch(`${API_BASE}/auth/logout`, {
			method: "POST",
			credentials: "include"
		})

		if (!resp.ok) {
			const err = await resp.text();
			renderError(`Logout failed: ${resp.status}: ${err}`);
			throw new Error(`Logout failed: ${resp.status}: ${err}`);
		}
		setItem<null>("id", null);
		setItem<null>("username", null);
		setItem<null>("display_name", null);
		setItem<null>("email", null);
		setItem<null>("avatar_url", null);
		setItem<boolean>("is_online", false);

		setItem<boolean>("loggedIn", false);

		window.location.href = "/login";
	} catch (err) {
		console.warn(err);
	}
}

export function redirectToLogin(): void {
	setItem<boolean>("loggedIn", false);
	window.location.href = "/login";
}

export async function refreshAccess(): Promise<void> {
	try {
		const resp = await fetch(`${API_BASE}/auth/refresh`, {
			method: "POST",
			credentials: "include"
		});

		if (resp.status == 404 && resp.text.length == 0)
			renderMessage("You appear to be offline. Some features may be unavailable");

		if (!resp.ok) {
			redirectToLogin();
		}

		setItem<boolean>("loggedIn", true);

	} catch (err) {
		console.error("Refresh failed:", err);
		redirectToLogin();
	}
}

export async function fetchProtected<T = unknown>(endpoint: string, opts: RequestInit = {}): Promise<T | null> {
	const resp = await fetch(`${API_BASE}${endpoint}`, {
		...opts,
		credentials: "include"
	});

	if (resp.status === 401) {
		await refreshAccess();

		const retry = await fetch(`${API_BASE}${endpoint}`, {
			...opts,
			credentials: "include"
		})
		
		if (!retry.ok) {
			console.error("Error while fetching resource:", resp.text)
			return null;
		}

		return (retry as T);
	}

	if (!resp.ok) {
		console.error("Error while fetching resource:", resp.text)
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
			console.warn("authenticate called")
			return true;
		}
		if (resp.status === 401) {
			await refreshAccess();

			const retry = await fetch(`${API_BASE}/auth/me`, {
				method: "GET",
				credentials: "include"
			});

			if (retry.status == 401) {
				return false;
			} else if (retry.status == 404) {
				renderMessage("You appear to be offline. Some features may be unavailable")
				return "offline";
			} else {
				renderMessage("Unexpected error while trying to authenticate user. Please try again later");
				return "fail";				
			}
		}

		if (resp.status === 404) {
			renderMessage("You appear to be offline. Some features may be unavailable")
			return "offline";
		}

		console.warn("Unexpected auth/me status:", resp.status);
		return resp.status.toString();
	}
	catch (err) {
		console.error ("Error while checking auth:", err);
		return "Error while checking auth";
	}
}