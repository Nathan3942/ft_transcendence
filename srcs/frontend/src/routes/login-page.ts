import { createButton } from "../components/button/button";

function loadLoginForm(): HTMLDivElement {
	const template = document.createElement("template");
	template.innerHTML = `
	<div>
		<h1 class="mb-6 text-center text-2xl font-bold">Login</h1>
			<form id="login">
				<input type="text" placeholder="Username" class="mb-4 w-full border p-2" />
					<input type="password" placeholder="Password" class="mb-2 w-full border p-2" />
					<div id="login-button-container"></div>
			</form>
				<p class="mt-4 text-center">
					Dont have an account?
					<button id="showRegister" class="text-blue-500 underline hover:text-blue-700">Register
				</button>
			</p>
	</div>
	`;

	return template.content.firstElementChild as HTMLDivElement;
}

function loadRegisterForm(): HTMLDivElement {
	const template = document.createElement("template");
	template.innerHTML = `
	<div>
		<h1 class="mb-6 text-center text-2xl font-bold">Register</h1>
	</div>
	`;

	return template.content.firstElementChild as HTMLDivElement;
}

export default function createLoginPage(): HTMLDivElement {

	const template = document.createElement("template");
	template.innerHTML = `
		<div class="flex h-screen w-screen items-center justify-center">
			<div id="form" class="items-center justify-center bg-gray-200 px-4 py-2 dark:bg-gray-950">
			</div>
		</div>
	`;

	const formContainer = template.content.querySelector("#form");
	if (formContainer)
		formContainer.appendChild(loadLoginForm());

	const testButton = createButton({
		id: "loginButton",
		f: () => console.log("Login Button has been pressed"),
		buttonText: "Login",
		extraClasses: "w-full bg-blue-500 p-2 hover:bg-blue-600 dark:bg-blue-900 dark:hover:bg-blue-950",
		type: "button",
	})

	const buttonContainer = template.content.querySelector("#login-button-container");
	if (buttonContainer) {
		buttonContainer.appendChild(testButton);
	}

	return template.content.firstElementChild as HTMLDivElement;
}