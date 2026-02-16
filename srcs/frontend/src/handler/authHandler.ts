import { API_BASE } from "./loginHandler"

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