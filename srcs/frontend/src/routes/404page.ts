export default async function create404Page(): Promise<HTMLElement>  {
	const template = document.createElement("template");
	
	template.innerHTML = `
	<div class="w-full h-full flex flex-col items-center justify-center">
		<h1 class="text-4xl font-bold text-center" id="error-title">404</h1>
		<p class="text-lg text-center" id"error-text">Page Not Found</p>
	</div>
	`;

	const page404 = template.content.firstElementChild as HTMLElement;
	return page404;
}