import { createButton } from "../components/button/button";

function makeBlock(blockClass: string, btn: HTMLButtonElement): HTMLDivElement {
	const block = document.createElement("div");
	block.className = blockClass + " " + "w-11/12 hover:w-full hover:brightness-90 dark:hover:brightness-130";
	block.appendChild(btn);

	return block;
}

export default function createGameOnlinePage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeBlock("bg-yellow-300 dark:bg-green-900", createButton({
			id: "create-match-button",
			extraClasses:btnClasses,
			buttonText: "Create Match",
			// f: createOnlineMatch(),
			/* icon: "",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert" */
			})
		),
		makeBlock("bg-yellow-300 dark:bg-yellow-900", createButton({
			id: "create-tournament-button",
			extraClasses: btnClasses,
			buttonText: "Create Tournament",
			// f: createOnlineTournament(),
			icon: "assets/images/trophy-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeBlock("bg-orange-300 dark:bg-orange-900", createButton({
			id: "browse-matches-button",
			extraClasses: btnClasses,
			buttonText: "Browse Matches",
			// f: displayMatchBrowser(),
			/* icon: "",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert" */
		}))
	);

	outer.appendChild(inner);

	return outer;
}