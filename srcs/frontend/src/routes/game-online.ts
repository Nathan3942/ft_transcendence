import createBackButton from "../components/button/backButton";
import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";

export default function createGameOnlinePage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	outer.append(createBackButton("bg-green-300 dark:bg-green-900", "/"));

	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-green-300 dark:bg-green-800", createButton({
			id: "create-match-button",
			extraClasses:btnClasses,
			buttonText: "Create Match",
			// f: createOnlineMatch(),
			icon: "assets/images/plus-large-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-lime-200 dark:bg-lime-800", createButton({
			id: "create-tournament-button",
			extraClasses: btnClasses,
			buttonText: "Create Tournament",
			// f: createOnlineTournament(),
			icon: "assets/images/trophy-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-emerald-300 dark:bg-emerald-900", createButton({
			id: "browse-matches-button",
			extraClasses: btnClasses,
			buttonText: "Browse Games",
			// f: displayMatchBrowser(),
			icon: "assets/images/list-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
		}))
	);

	outer.appendChild(inner);

	return outer;
}