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
		createButton({
			id: "user-profile-button",
			// f: () => show user menu dropdown
			icon: "assets/images/user-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-8 dark:invert"
		})
	)
	
	header.append(title, navbar);
	
	return header;
}