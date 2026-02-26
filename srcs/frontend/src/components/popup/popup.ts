import { createButton } from "../button/button";

function showPopup() {
	const popup = document.getElementById("popup");
	if (popup)
		popup.classList.remove("hidden");
	else
		console.warn("Unable to hide popup, page may be built incorrectly");
}

function hidePopup() {
	const popup = document.getElementById("popup");
	if (popup)
		popup.classList.add("hidden");
	else
		console.warn("Unable to hide popup, page may be built incorrectly");
}

export function modifyPopup(popupText: string, popupClasses: string) {
	const popup = document.getElementById("popup");
	if (popup) {
		popup.classList = popupClasses;
		popup.innerText = popupText;
	}
	else
		console.warn("Unable to hide popup, page may be built incorrectly");
}

export default function buildPopup(popupText: string, ): HTMLDivElement {
	const popup = document.createElement("div");
	popup.id = "popup";
	popup.className = "hidden";
	popup.append(createButton({
		icon: "assets/images/cross-circle-svgrepo-com.svg",
		iconAlt: "icon",
		iconBClass: "",
	}));
	popup.innerText = popupText;

	return popup;
}