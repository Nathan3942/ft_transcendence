import { createButton } from "../button/button";

export function buildFriendOverlay(): HTMLDivElement {
	const overlay = document.createElement("div");
	overlay.classList.add("w-full", "h-[calc(100vh-60px-48px)]",
		"flex", "absolute", "left-0", "top-15", "viewport", "z-[100]",
		"hidden");

	overlay.id = "headerFriendOverlay";

	const rightElement = document.createElement("div");
	rightElement.classList.add("w-3/5", "h-full",
		"bg-gray-100/20", "dark:bg-gray-900/30");
		
	rightElement.innerHTML = `
		<button id="closeFriendOverlayButton"></button>
	`;

	const leftElement = document.createElement("div");
	leftElement.classList.add("flex", "flex-col",
		"w-2/5", "h-full",
		"bg-gray-300", "dark:bg-gray-700");
	
	const inputClasses = [
		"mt-1 w-full px-3 py-2",
		"bg-gray-200 dark:bg-gray-800",
		"text-gray-900 dark:text-white text-base",
		"border-2 border-gray-400 dark:border-gray-500",
		"focus:outline-none focus:border-green-500 dark:focus:border-green-400",
		"placeholder-gray-400 dark:placeholder-gray-500",
		"rounded-none"
	].join(" ");

	const dividerClasses = [
		"mt-4 mx-6",
		"border-t-2 border-dashed border-gray-700 dark:border-gray-400"
	].join(" ");

	leftElement.innerHTML = `

		<section class="pt-4 m-4">
			<h1 class="text-2xl">Add Friend</h1>
			<form id="addFriendForm">
				<input id="addFriendInput" required placeholder="Friend Id" class="${inputClasses}">
				</input>

				<button id="addFriendButton"></button>
			</form>
		</section>
			<div class="${dividerClasses}"></div>
		<section class="pt-4 m-4">
			<h1 class="text-2xl">Online Friends</h1>
			<ul id="onlineFriendList">

			</ul>
		</section>
			<div class="${dividerClasses}"></div>
		<section class="pt-4 m-4">
			<h1 class="text-2xl">Offline Friends</h1>
			<ul id="offlineFriendList">

			</ul>
		</section>
	
	`
	
	overlay.append(leftElement, rightElement);
	return overlay;
}

export function populateFriendOverlay(): void {
	const overlay = document.getElementById("headerFriendOverlay") as HTMLDivElement;
	const closeOverlay = document.getElementById("closeFriendOverlayButton") as HTMLButtonElement;
	const addFriendButton = document.getElementById("addFriendButton") as HTMLButtonElement;

	if (overlay!.classList.contains("hidden"))
		overlay!.classList.remove("hidden");
	else
		overlay!.classList.add("hidden");

	closeOverlay!.replaceWith(createButton({
		id: "closeFriendOverlayButton",
		extraClasses: "w-full h-full",
		f: () => {
			document.getElementById("headerFriendOverlay")!.classList.add("hidden");
		}
	}));

	const buttonClasses = [
		"w-full py-2 mt-2",
		"bg-blue-500 dark:bg-blue-900",
		"rounded-md",
		"hover:bg-blue-600 hover:dark:bg-blue-800",
		"transition-colors duration-100"
	].join(" ")

	addFriendButton!.replaceWith(createButton({
		id: "addFriendButton",
		buttonText: "Add Friend",
		type: "submit",
		extraClasses: buttonClasses,
	}))
}