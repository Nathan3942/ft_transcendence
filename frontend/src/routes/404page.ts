export default function create404Page(): HTMLDivElement  {
	const template = document.createElement("template");
	
	template.innerHTML = `
	<div class="flex-1 flex flex-col items-center justify-center">
		<h1 class="text-6xl font-bold text-center" id="error-title">404</h1>
		<p class="text-4xl text-center" id="error-text">Page Not Found</p>
	</div>
	`;

	const page404 = template.content.firstElementChild as HTMLDivElement;
	return page404;
}