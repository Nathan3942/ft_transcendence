export default async function createHeader(): Promise<HTMLDivElement> {
	const template = document.createElement("template");
	template.innerHTML = `
	<header id="template" class="fixed top-0 left-0 right-0 min-h-20 h-20 flex justify-between align-middle items-center">
		<div class="px-4 text-2xl">PONG</div>
		<div class="flex justify-end space-x-5" id="navbar"></div>
	</header>
	`

	return template.content.firstElementChild as HTMLDivElement;
}