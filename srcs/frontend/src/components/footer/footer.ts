export default function createFooter(): HTMLDivElement {
	const template = document.createElement("template");
	template.innerHTML = `
		<footer class="w-full flex align-bottom justify-center bg-gray-200 dark:bg-gray-800 p-3 dark:text-white">
				<div class="">© hlibine & tmontani & njeanbou</div>
		</footer>
	`
	return template.content.firstElementChild as HTMLDivElement;
}