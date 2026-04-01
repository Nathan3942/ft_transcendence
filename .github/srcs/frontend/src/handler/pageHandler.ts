import createHeader from "../components/header/header";
import createFooter from "../components/footer/footer";
import buildPopup from "../components/popup/popup";
import { buildFriendOverlay } from "../components/header/friendOverlay";

export default function assemblePage(element: HTMLDivElement) : HTMLDivElement {
	const div = document.createElement("div");

	div.className = "flex flex-col w-full h-full";
	element.classList.add("bg-gray-50", "dark:bg-gray-900", "viewport", "z-[1]");
	element.append(buildFriendOverlay())
	div.append(createHeader(), element, createFooter(), buildPopup());

	return div; 
}