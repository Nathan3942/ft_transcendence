import { createButton } from "../components/button/button";

function makeBlock(blockClass: string, btn: HTMLButtonElement): HTMLDivElement {
	const block = document.createElement("div");
	block.className = blockClass + " " + "w-11/12 hover:w-full hover:brightness-90 dark:hover:brightness-130";
	block.appendChild(btn);

	return block;
}

export default function createGameLocalPage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeBlock("bg-blue-300 dark:bg-blue-900", createButton({
			id: "vs-player-button",
			extraClasses:btnClasses,
			buttonText: "Vs AI",
			href: "/game-local-ai"
			})
		),
		makeBlock("bg-red-300 dark:bg-red-900", createButton({
			id: "vs-ai-button",
			extraClasses: btnClasses,
			buttonText: "Vs Player",
			href: "/game-local-player"
			})
		)
	);

	outer.appendChild(inner);

	return outer;
}