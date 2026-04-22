import createHeader from "../components/header/header.js";
import createFooter from "../components/footer/footer.js";
import buildPopup from "../components/popup/popup.js";
import { buildFriendOverlay } from "../components/header/friendOverlay.js";

export default function assemblePage(element: HTMLDivElement) : HTMLDivElement {
	const div = document.createElement("div");

	div.className = "flex flex-col w-full h-full";
	element.classList.add("bg-gray-50", "dark:bg-gray-900", "viewport", "z-[1]", "overflow-y-auto", "min-h-0");
	element.append(buildFriendOverlay())
	div.append(createHeader(), element, createFooter(), buildPopup());

	return div; 
}