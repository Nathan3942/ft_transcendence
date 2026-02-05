export default function makeButtonBlock(blockClass: string, btn: HTMLButtonElement): HTMLDivElement {
	const block = document.createElement("div");
	block.className = blockClass + " " + "w-11/12 hover:w-full hover:brightness-90 dark:hover:brightness-130";
	block.appendChild(btn);

	return block;
}