export default function createHeader(): HTMLDivElement {
	const template = document.createElement("template");
	template.innerHTML = `
		<header id="template" class="min-h-15 h-15 flex justify-between align-middle items-center bg-gray-200 dark:bg-gray-800">
			<div class="px-4 text-2xl">PONG</div>
			<div class="flex justify-end space-x-5 px-4" id="navbar"></div>
		</header>
	`

	return template.content.firstElementChild as HTMLDivElement;
}