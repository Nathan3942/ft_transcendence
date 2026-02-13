import { API_BASE, refreshAccess } from "./loginHandler"

export async function authenticate(): Promise<boolean> {
    const resp = await fetch(`${API_BASE}/auth/me`, {
        method: "POST",
        credentials: "include"
    });

    if (resp.status === 401) {
        refreshAccess();
        return (false);
    }

    return (true);
}