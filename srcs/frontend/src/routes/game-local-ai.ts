import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";

function InitAiGame(diff: number) {
	// Replace on screen elements with the game, and init it in ai mode with the selected difficulty
}

export default function createLocalAIGamePage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-blue-300 dark:bg-blue-900", createButton({
			id: "diff-easy-btn",
			extraClasses:btnClasses,
			buttonText: "Easy",
			f: () => InitAiGame(1)
			})
		),
		makeButtonBlock("bg-purple-300 dark:bg-purple-900", createButton({
			id: "diff-medium-btn",
			extraClasses: btnClasses,
			buttonText: "Medium",
			f: () => InitAiGame(2)
			})
		),
		makeButtonBlock("bg-red-300 dark:bg-red-900", createButton({
			id: "diff-hard-btn",
			extraClasses: btnClasses,
			buttonText: "Hard",
			f: () => InitAiGame(3)
			})
		)
	);

	outer.appendChild(inner);

	return outer;
}