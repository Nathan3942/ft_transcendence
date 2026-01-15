export default function createFooter(): HTMLDivElement {
	const template = document.createElement("template");
	template.innerHTML = `
		<footer class="fixed w-full bottom-0">
			<div class="justify-center flex w-full bg-gray-100 dark:bg-gray-800 p-[20px] dark:text-white">
				<div class="flex m-1">Copyright - I dislike CSS</div>
			</div>
		</footer>
	`
	return template.content.firstElementChild as HTMLDivElement;
}