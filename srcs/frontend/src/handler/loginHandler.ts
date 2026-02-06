import type { loginRequest, loginResponse } from "../interfaces/properties";

const API_BASE = "/api";

export async function loginHandler(payload: loginRequest): Promise<loginResponse> {
    const resp = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
        /*
        If we wanna do an http cookie
        credintials: "include"
        */
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Login failed: ${resp.status}: ${err}`);
    }

    const out = (await resp.json()) as loginResponse;
    return out;
}