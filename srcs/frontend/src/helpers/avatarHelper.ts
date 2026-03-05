import { getItem } from "./localStoragehelper";

export function getLocalUserAvatar(): string {
	
	const url = getItem<string>("avatar_url")
	
	if (url) {
		return url;
	}
	return "assets/images/user-svgrepo-com.svg";
}