import { getItem } from "./localStoragehelper";

export const BASE_PFP = "assets/images/user-svgrepo-com.svg?raw";

export function getLocalUserAvatar(): string {
	
	const url = getItem<string>("avatar_url")
	
	if (url) {
		return url;
	}
	return BASE_PFP;
}
