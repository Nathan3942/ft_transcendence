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
			/* icon: "",
			iconAlt: "Icon",
			iconBClass: "" */
		}),
		createButton({
			id: "notification-center-button",
			// f: () => display notification dropdown / overlay
			/* icon: "",
			iconAlt: "Icon",
			iconBClass: "" */
		}),
		createButton({
			id: "user-profile-button",
			// f: () => show user menu dropdown
			/* icon: "",
			iconAlt: "Icon",
			iconBClass: "" */
		})
	)
	
	header.append(title, navbar);
	
	return header;
}