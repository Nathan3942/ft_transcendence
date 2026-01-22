import { createButton } from "../components/button/button";

export default function createHomePage(): HTMLDivElement {

	const template = document.createElement("template");
	template.innerHTML = `
		<div class="flex flex-1 flex-col justify-center items-end">
			<div class="text-3xl w-9/12 h-2/3 flex flex-col items-end justify-between">
				<div class="w-11/12 hover:w-full bg-blue-300 dark:bg-blue-900 hover:brightness-90 dark:hover:brightness-130">
					<button id="local-button"></button>
				</div>
				<div class="w-11/12 hover:w-full bg-green-300 dark:bg-green-900 hover:brightness-90 dark:hover:brightness-130">
					<button class="w-full h-full flex flex-row p-4"><img src="assets/images/globe-svgrepo-com.svg" alt="Icon" class="h-10 pr-2 dark:invert">Online Play</button>
				</div>
				<div class="w-11/12 hover:w-full bg-red-300 dark:bg-red-900 hover:brightness-90 dark:hover:brightness-130">
					<button class="w-full h-full flex flex-row p-4"><img src="assets/images/square-poll-vertical-svgrepo-com.svg" alt="Icon" class="h-10 pr-2 dark:invert">Leaderboard</button>
				</div>
				<div class="w-11/12 hover:w-full bg-purple-300 dark:bg-purple-900 hover:brightness-90 dark:hover:brightness-130">
					<button class="w-full h-full flex flex-row p-4"><img src="assets/images/circle-information-svgrepo-com.svg" alt="Icon" class="h-10 pr-2 dark:invert">About</button>
				</div>
			</div>
		</div>
	`;

	const localButton = createButton({
		id: "local-button",
		type: "button",
		extraClasses: "w-full h-full flex flex-row p-4",
		buttonText: "Local Play",
		icon: "assets/images/monitor-svgrepo-com.svg",
		iconAlt: "Icon",
		iconBClass: "h-10 pr-2 dark:invert",
		href: "/game-local"
	});

	const localButtonInsert = template.content.querySelector("#local-button");
	if (localButtonInsert) {
		localButtonInsert.replaceWith(localButton);
	}

	return template.content.firstElementChild as HTMLDivElement;
}