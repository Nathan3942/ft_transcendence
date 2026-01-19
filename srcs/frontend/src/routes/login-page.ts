import { createButton } from "../components/button/button";

function createLoginForm(): HTMLDivElement {
	const template = document.createElement("template");
	template.innerHTML = `
		<div>
			<h1 class="mb-6 text-center text-2l font-bold">Login</h1>
			<form id="login-form">
				<input type="text" placeholder="Username" class="mb-4 w-full border p-2" />
				<input type="password" placeholder="Password" class="mb-2 w-full border p-2" />
				<div id="login-button-container"></div>
			</form>
			<p class="mt-4 text-center">
				Don't have an account?
				<button id="show-register-button"></button>
			</p>
		</div>
	`;

	return template.content.firstElementChild as HTMLDivElement;
}

function createRegistrationForm(): HTMLDivElement {
	const template = document.createElement("template");
	template.innerHTML = `
		<div>
			<h1 class="mb-6 text-center text-2xl font-bold">Register</h1>
			<form id="register-form">
				<input type="text" placeholder="Username" class="mb-4 w-full border p-2" />
				<input type="password" placeholder="Password" class="mb-2 w-full border p-2" />
				<input type="password" placeholder="Confirm your password" class="mb-2 w-full border p-2" />
				<div id="registration-button-container"></div>
			</form>
			<p class="mt-4 text-center">
				Already have an account?
				<button id="show-login-button"></button>
			</p>
		</div>
	`;

	return template.content.firstElementChild as HTMLDivElement;
}

export default function createLoginPage(): HTMLDivElement {
	const template = document.createElement("template");
	template.innerHTML = `
		<div class="flex h-screen w-screen items-center justify-center">
			<div id="form-container" class="items-center justify-center bg-gray-200 px-4 py-2 dark:bg-gray-950">
			</div>
		</div>
	`;

	const formContainer = template.content.querySelector("#form-container");
	if (formContainer) {
		formContainer.appendChild(createLoginForm());
	}

	const loginButton = createButton({
		id: "login-button",
		f: () => console.log("Login Button has been pressed"),
		buttonText: "Login",
		extraClasses: "w-full bg-blue-500 p-2 hover:bg-blue-600 dark:bg-blue-900 dark:hover:bg-blue-950",
		type: "button",
	});

	const loginButtonContainer = template.content.querySelector("#login-button-container");
	if (loginButtonContainer) {
		loginButtonContainer.appendChild(loginButton);
	}

	const startRegisterButton = createButton({
		id: "register-button",
		f: () => {
			if (formContainer) {
				formContainer.innerHTML = "";
				formContainer.append(createRegistrationForm());
			}
		},
		buttonText: "Register.",
		extraClasses: "text-blue-500 underline hover:text-blue-700",
		type: "button",
	});

	const showRegisterButton = template.content.querySelector("#show-register-button");
	if (showRegisterButton) {
		showRegisterButton.append(startRegisterButton);
	}

	return template.content.firstElementChild as HTMLDivElement;
}