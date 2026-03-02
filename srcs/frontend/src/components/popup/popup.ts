import { createButton } from "../button/button";

export function renderMessage(text: string): void {
	modifyPopup(text, "fixed bottom-4 left-4 max-w-sm p-4 pr-6 bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-50");
	showPopup();
}

export function renderError(err: string): void {
	modifyPopup(err, "fixed bottom-4 left-4 max-w-sm p-4 pr-6 bg-red-100 dark:bg-red-700 text-red-800 dark:text-red-200");
	showPopup();
}

export function showPopup() {
	const popup = document.getElementById("popup");
	if (popup)
		popup.classList.remove("hidden");
	else
		console.warn("Unable to show popup, page may be built incorrectly");
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
		popup.append(createButton({
			icon: "assets/images/cross-circle-svgrepo-com.svg",
			iconAlt: "Close popup",
			iconBClass: "absolute top-2 right-2 w-6 h-6 dark:invert hover:opacity-80",
			f: () => hidePopup()
		}));
	}
	else
		console.warn("Unable to modify popup, page may be built incorrectly");
}

export default function buildPopup(): HTMLDivElement {
	const popup = document.createElement("div");
	popup.id = "popup";
	popup.className = "hidden";

	return popup;
}