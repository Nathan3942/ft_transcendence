export default function createTestPage(): HTMLDivElement  {
	const template = document.createElement("template");
	
	template.innerHTML = `
	<div class="flex-1">test</div>
	`;

	const pageTest = template.content.firstElementChild as HTMLDivElement;
	return pageTest;
}