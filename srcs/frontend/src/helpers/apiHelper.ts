import { authenticate } from "../handler/loginHandler";
import type { user } from "../interfaces/properties";
import { getItem } from "./localStoragehelper";

export function getLocalId(): number | null {
	let id: number | null = getItem("id");
	if (id === null) {
		authenticate();
		id = getItem("id");
	}
	return (id);
}

export function getOnlineUser(): user | string {

}