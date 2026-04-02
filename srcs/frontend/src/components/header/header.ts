import { logoutHandler } from "../../handler/loginHandler";
import { BASE_PFP, getLocalUserAvatar } from "../../helpers/avatarHelper";
import { getItem } from "../../helpers/localStoragehelper";
import { createButton } from "../button/button";
import { populateFriendOverlay } from "./friendOverlay";

export default function createHeader(): HTMLHeadElement {

	const header = document.createElement("header");
	const title = document.createElement("div");
	const navbar = document.createElement("div");
	
	header.className = "min-h-15 h-15 flex justify-between align-middle items-center bg-gray-200 dark:bg-gray-800 header z-[200]";
	
	title.appendChild(createButton({
		id: "home-button",
		buttonText: "PONG",
		extraClasses: "px-4 text-2xl hover:opacity-80",
		href: "/"
	}))

	navbar.className = "flex justify-end space-x-5 px-4";
	navbar.id = "navbar";
	if ((getItem<boolean>("loggedIn") ?? false) === true) {
		const userDropdown = document.createElement("div");
		const bridge = document.createElement("div");
		bridge.className = "absolute w-full h-4 right-0 z-10 group-hover:visible";

		userDropdown.className = "invisible opacity-0 absolute mt-3.5 right-0 px-2 bg-gray-200 dark:bg-gray-800 shadow-lg py-2 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 z-10";
		userDropdown.append((
			createButton({
				id: "user-profile-button",
				href: "/user-profile",
				buttonText: "Profile",
				extraClasses: "hover:opacity-80"
			})),
			createButton({
				id: "user-settings-button",
				href: "/user-settings",
				buttonText: "Settings",
				extraClasses: "hover:opacity-80"
			}),
			createButton({
				id: "logout-button",
				f: () => logoutHandler(),
				buttonText: "Logout",
				extraClasses: "hover:opacity-80"
			})
		);

		const avatar = getLocalUserAvatar();
		let bclasses = ""
		if (avatar == BASE_PFP)
			bclasses = "h-8 w-8 dark:invert";
		else
			bclasses = "h-8 w-8";

		const userProfileBtn = createButton({
				id: "user-profile-dropdown",
				extraClasses: "relative group",
				// f: () => show user menu dropdown
				icon: avatar,
				iconId: "header-user-pfp",
				iconAlt: "Icon",
				iconBClass: bclasses
			});

		userProfileBtn.append(bridge, userDropdown);

		navbar.append(
			createButton({
				id: "friend-menu-button",
				f: () => populateFriendOverlay(0),
				icon: "assets/images/users-svgrepo-com.svg?raw",
				iconAlt: "Icon",
				iconBClass: "h-8 w-8 dark:invert hover:opacity-80"
			}),
			createButton({
				id: "notification-center-button",
				// f: () => display notification dropdown / overlay
				icon: "assets/images/bell-svgrepo-com.svg?raw",
				iconAlt: "Icon",
				iconBClass: "h-8 w-8 dark:invert"
			}),
			userProfileBtn
		);
	} else {
		navbar.append(
			createButton({
				id: "leaderboard-header-button",
				buttonText: "Leaderboard",
				href: "/leaderboard",
				extraClasses: "hover:text-red-900 dark:hover:text-red-500 transition-colors duration-200"
			}),
			createButton({
				id: "login-header-button",
				buttonText: "Login",
				href: "/login",
				extraClasses: "hover:text-blue-900 dark:hover:text-blue-400 transition-colors duration-200"
			})
		);
	}
	
	header.append(title, navbar);
	return header;
}
