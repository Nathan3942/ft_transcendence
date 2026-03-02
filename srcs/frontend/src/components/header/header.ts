import { logoutHandler } from "../../handler/loginHandler";
import { getItem } from "../../helpers/localStoragehelper";
import { createButton } from "../button/button";

export default function createHeader(): HTMLHeadElement {

	const header = document.createElement("header");
	const title = document.createElement("div");
	const navbar = document.createElement("div");
	
	header.className = "min-h-15 h-15 flex justify-between align-middle items-center bg-gray-200 dark:bg-gray-800";
	
	title.appendChild(createButton({
		id: "home-button",
		buttonText: "PONG",
		extraClasses: "px-4 text-2xl",
		href: "/"
	}))

	navbar.className = "flex justify-end space-x-5 px-4";
	navbar.id = "navbar";
	
	if (getItem("loggedIn") === true) {
		const userDropdown = document.createElement("div");

		userDropdown.className = "invisible opacity-0 absolute right-0 mt-2 px-2 bg-white dark:bg-gray-700 shadow-lg py-2 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 z-10";
		userDropdown.append((
			createButton({
				id: "user-profile-button",
				href: "/user-profile",
				buttonText: "Profile"
			})),
			createButton({
				id: "user-settings-button",
				href: "/user-settings",
				buttonText: "Settings"
			}),
			createButton({
				id: "logout-button",
				f: () => logoutHandler(),
				buttonText: "Logout"
			})
		);

		const userProfileBtn = createButton({
				id: "user-profile-dropdown",
				extraClasses: "relative group",
				// f: () => show user menu dropdown
				icon: "assets/images/user-svgrepo-com.svg",
				iconAlt: "Icon",
				iconBClass: "h-8 dark:invert"
			});

		userProfileBtn.append(userDropdown);

		navbar.append(
			createButton({
				id: "friend-menu-button",
				//  f: () => display friend dropdown / overlay
				icon: "assets/images/users-svgrepo-com.svg",
				iconAlt: "Icon",
				iconBClass: "h-8 dark:invert"
			}),
			createButton({
				id: "notification-center-button",
				// f: () => display notification dropdown / overlay
				icon: "assets/images/bell-svgrepo-com.svg",
				iconAlt: "Icon",
				iconBClass: "h-8 dark:invert"
			}),
			userProfileBtn
		);
	} else {
		navbar.append(
			createButton({
				id: "leaderboard-header-button",
				buttonText: "Leaderboard",
				href: "/leaderboard"
			}),
			createButton({
				id: "login-header-button",
				buttonText: "Login",
				href: "/login"
			})
		);
	}
	
	header.append(title, navbar);
	
	return header;
}