export default function makeButtonBlock(blockClass: string, btn: HTMLButtonElement): HTMLDivElement {
	const block = document.createElement("div");
	block.className =  [
		blockClass,
		"w-11/12 hover:w-full",
		"hover:brightness-90 dark:hover:brightness-130 hover:shadow-lg transition-scale duration-200"
	].join(" ");
	block.appendChild(btn);

	return block;
}