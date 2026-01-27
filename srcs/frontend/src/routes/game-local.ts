import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";

export default function createGameLocalPage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-blue-300 dark:bg-blue-900", createButton({
			id: "vs-ai-button",
			extraClasses:btnClasses,
			buttonText: "Player vs AI",
			href: "/game-local-ai",
			icon: "assets/images/robot-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-purple-300 dark:bg-purple-900", createButton({
			id: "vs-player-button",
			extraClasses: btnClasses,
			buttonText: "Player vs Player",
			// f: () => createLocalMatch(),
			icon: "assets/images/keyboard-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		), 
		makeButtonBlock("bg-cyan-300 dark:bg-cyan-900", createButton({
			id: "create-local-tournament",
			extraClasses: btnClasses,
			buttonText: "Local Tournament",
			// f: () => createLocalTournament(),
			icon: "assets/images/trophy-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
		}))
	);

	outer.appendChild(inner);

	return outer;
}