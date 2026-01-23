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
					<button id="online-button"></button>
				</div>
				<div class="w-11/12 hover:w-full bg-red-300 dark:bg-red-900 hover:brightness-90 dark:hover:brightness-130">
					<button id="leaderboard-button"></button>
				</div>
				<div class="w-11/12 hover:w-full bg-purple-300 dark:bg-purple-900 hover:brightness-90 dark:hover:brightness-130">
					<button id="about-button"></button>
				</div>
			</div>
		</div>
	`;

	const buttonClasses: string = "w-full h-full flex flex-row p-4";
	const iconBClasses: string = "h-10 pr-2 dark:invert";

	const localButton = createButton({
		id: "local-button",
		extraClasses: buttonClasses,
		buttonText: "Local Play",
		icon: "assets/images/monitor-svgrepo-com.svg",
		iconAlt: "Icon",
		iconBClass: iconBClasses,
		href: "/game-local"
	});

	const localButtonInsert = template.content.querySelector("#local-button");
	if (localButtonInsert)
		localButtonInsert.replaceWith(localButton);


	const onlineButton = createButton({
		id: "online-button",
		extraClasses: buttonClasses,
		buttonText: "Online Play",
		icon: "assets/images/globe-svgrepo-com.svg",
		iconAlt: "Icon",
		iconBClass: iconBClasses,
		href: "/game-online"
	});

	const onlineButtonInsert = template.content.querySelector("#online-button");
	if (onlineButtonInsert)
		onlineButtonInsert.replaceWith(onlineButton);

	const leaderboardButton = createButton({
		id: "leaderboard-button",
		extraClasses: buttonClasses,
		buttonText: "Leaderboard",
		icon: "assets/images/square-poll-vertical-svgrepo-com.svg",
		iconAlt: "Icon",
		iconBClass: iconBClasses,
		href: "/leaderboard"
	});

	const leaderboardButtonInsert = template.content.querySelector("#leaderboard-button");
	if (leaderboardButtonInsert)
		leaderboardButtonInsert.replaceWith(leaderboardButton);


	const aboutButton = createButton({
		id: "about-button",
		extraClasses: buttonClasses,
		buttonText: "About",
		icon: "assets/images/circle-information-svgrepo-com.svg",
		iconAlt: "Icon",
		iconBClass: iconBClasses,
		href: "/about"
	});

	const aboutButtonInsert = template.content.querySelector("#about-button");
	if (aboutButtonInsert)
		aboutButtonInsert.replaceWith(aboutButton);

	return template.content.firstElementChild as HTMLDivElement;
}