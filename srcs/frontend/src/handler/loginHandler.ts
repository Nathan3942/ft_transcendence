import type { loginRequest } from "../interfaces/properties";

export const API_BASE = "/api/v1";

export async function loginHandler(payload: loginRequest): Promise<string> {
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
		throw new Error(`Login failed: ${resp.status}: ${err}`);
	}

	return await resp.json();
}

export async function logoutHandler() {
	await fetch(`${API_BASE}/auth/logout`, {
		method: "POST",
		credentials: "include"
	})
}

let loginRedirectPending = false;
export function redirectToLogin(): void {
	if (loginRedirectPending)
		return;
	loginRedirectPending = true;
	window.location.href = "/login";
}

export async function refreshAccess(): Promise<void> {
	try {
		const resp = await fetch(`${API_BASE}/auth/refresh`, {
			method: "POST",
			credentials: "include"
		});

		if (!resp.ok) {
			redirectToLogin();
		}
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

		const retry = await fetch(`${API_BASE}/auth/refresh`, {
			...opts,
			credentials: "include"
		});

		if (!retry.ok)
			return null;
		return (await retry.json() as T)
	}

	if (!resp.ok)
		return null;

	return (await resp.json() as T);
}

export async function authenticate(): Promise<boolean | null> {
	try {
		const resp = await fetch(`${API_BASE}/auth/me`, {
			method: "GET",
			credentials: "include"
		});

		if (resp.status === 200) {
			console.warn("authenticate called")
			return true;
		}
		if (resp.status === 401) {
			return false;
		}

		console.warn("Unexpected auth/me status:", resp.status);
		return null;
	}
	catch (err) {
		console.error ("Error while checking auth:", err);
		return null;
	}
}