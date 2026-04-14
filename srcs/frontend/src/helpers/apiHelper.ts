import { API_BASE, authenticate } from "../handler/loginHandler.js";
import type { user } from "../interfaces/properties.js";
import { getItem } from "./localStoragehelper.js";

export async function fetchUser(userId: number): Promise<user> {
    const resp = await fetch(`${API_BASE}/users/${userId}`, {
        method: "GET",
        credentials: "include"
    });

    if (resp.ok) {
        const respJson = await resp.json() as { data: user };
        return respJson.data;
    } else if (resp.status === 404)
        throw new Error("404: User not found");
    else
        throw new Error(`Unexpected error: ${resp.status}`);
}

export function getLocalId(): number | null {
	let id: number | null = getItem("id");
	if (id === null) {
		authenticate();
		id = getItem("id");
	}
	return (id);
}