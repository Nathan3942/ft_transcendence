import { authenticate } from "../handler/loginHandler.js";
import type { user } from "../interfaces/properties.js";
import { getItem } from "./localStoragehelper.js";

export function getLocalId(): number | null {
	let id: number | null = getItem("id");
	if (id === null) {
		authenticate();
		id = getItem("id");
	}
	return (id);
}