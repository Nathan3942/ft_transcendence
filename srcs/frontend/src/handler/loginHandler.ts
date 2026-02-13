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
    await fetch(`${API_BASE}/auth/logout`)
}

export async function refreshAccess(): Promise<void> {
    const resp = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include"
    });

    if (!resp.ok) {
        window.location.href = "/login";
    }
}

export async function fetchProtected(endpoint: string, opts: RequestInit = {}): Promise<string> {
    const resp = await fetch(`${API_BASE}${endpoint}`, {
        ...opts,
        credentials: "include"
    });

    if (resp.status === 401) {
        refreshAccess();
    }
    return resp.json();
}