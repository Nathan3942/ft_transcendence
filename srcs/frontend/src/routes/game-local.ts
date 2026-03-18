import createBackButton from "../components/button/backButton";
import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";

export default function createGameLocalPage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	outer.append(createBackButton("bg-blue-400 dark:bg-blue-800", "/"))
	
	const btnClasses = "w-full h-full flex flex-row p-4"; 
	const iconClasses = "h-10 w-10 pr-3 dark:invert"

	inner.append(
		makeButtonBlock("bg-blue-300 dark:bg-blue-900", createButton({
			id: "vs-ai-button",
			extraClasses:btnClasses,
			buttonText: "Player vs AI",
			href: "/game-local-ai",
			icon: "assets/images/robot-svgrepo-com.svg?raw",
			iconAlt: "Icon",
			iconBClass: iconClasses
			})
		),
		makeButtonBlock("bg-purple-300 dark:bg-purple-900", createButton({
			id: "vs-player-button",
			extraClasses: btnClasses,
			buttonText: "Player vs Player",
			// f: () => createLocalMatch(),
			icon: "assets/images/keyboard-svgrepo-com.svg?raw",
			iconAlt: "Icon",
			iconBClass: iconClasses
			})
		), 
		makeButtonBlock("bg-cyan-200 dark:bg-cyan-900", createButton({
			id: "create-local-tournament",
			extraClasses: btnClasses,
			buttonText: "Local Tournament",
			// f: () => createLocalTournament(),
			icon: "assets/images/trophy-svgrepo-com.svg?raw",
			iconAlt: "Icon",
			iconBClass: iconClasses
		}))
	);

	outer.appendChild(inner);

	return outer;
}