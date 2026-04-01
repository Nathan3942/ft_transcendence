import { getItem } from "./localStoragehelper.js";

export function getLocalUserAvatar(): string {
	
	const url = getItem<string>("avatar_url")
	
	if (url) {
		return url;
	}
	return "assets/images/user-svgrepo-com.svg?raw";
}