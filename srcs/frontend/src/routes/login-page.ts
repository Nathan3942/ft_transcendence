import { createButton } from "../components/button/button.js";
import { loginHandler, registerHandler } from "../handler/loginHandler.js";
import { getItem } from "../helpers/localStoragehelper.js";

let defaultClasses = "w-1/3 items-center justify-center bg-gray-200 px-4 py-2 dark:bg-gray-950";

function createLoginForm(): HTMLDivElement {

	const outer = document.createElement("div");
	const form = document.createElement("form");
	const textInput = document.createElement("input");
	const passInput = document.createElement("input"); 
	const h1 = document.createElement("h1");
	const p = document.createElement("p");
	const errorMsg = document.createElement("p");

	outer.id = "login-container";
	outer.className = defaultClasses;
	
	h1.className = "mb-6 text-center text-2xl font-bold";
	h1.append("Login");
	
	form.id = "login-form"

	textInput.type = "text";
	textInput.placeholder = "Email";
	textInput.className = "mb-2 w-full border p-2 boder-gray-50";

	passInput.type = "password";
	passInput.placeholder = "Password";
	passInput.className = "mb-4 w-full border p-2 boder-gray-50";

	errorMsg.className = "text-red-600 mb-2 hidden";

	form.append(textInput, passInput, errorMsg, createButton({
		id: "login-button",
		buttonText: "Login",
		extraClasses: "w-full bg-blue-500 p-2 hover:bg-blue-600 dark:bg-blue-900 dark:hover:bg-blue-950 transition-color duration-200",
		type: "submit"
	}));

	p.className = "mt-4 text-center";
	p.append("Don't have an account? ", createButton({
		id: "register-button",
		f: () => {
			const regCont = document.getElementById("register-container")
			if (regCont) {
				outer.classList.add("hidden");
				regCont.classList.remove("hidden");
			}
		},
		buttonText: "Register.",
		extraClasses: "text-blue-500 underline hover:text-blue-700 transition-color duration-200",
		type: "button"
	}));
	
	outer.append(h1, form, p);

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		errorMsg.textContent = "";
		errorMsg.classList.add("hidden");

		if (textInput.classList.contains("border-red-500")) {
			textInput.classList.add("boder-gray-50");
			textInput.classList.remove("border-red-500");
		}

		if (passInput.classList.contains("border-red-500")) {
			passInput.classList.add("boder-gray-50");
			passInput.classList.remove("border-red-500");
		}

		const payload = {
			email: textInput.value.trim(),
			password: passInput.value
		};

		try {
			if (payload.email.length === 0) {
				textInput.classList.add("border-red-500");
				textInput.classList.remove("boder-gray-50");
				throw new Error("Email field empty");
			} else if (payload.password.trim().length === 0) {
				passInput.classList.add("border-red-500");
				passInput.classList.remove("boder-gray-50");
				throw new Error("Password field empty");
			}
			
			const result = await loginHandler(payload);
			if (result === 400) {
				throw new Error("400: Login has missing field(s)");
			} else if (result === 401) {
				textInput.classList.add("border-red-500");
				textInput.classList.remove("boder-gray-50");
				passInput.classList.add("border-red-500");
				passInput.classList.remove("boder-gray-50");
				throw new Error("401: Invalid Credentials");
			} else if (result != 200) {
				throw new Error(`Unexpected error: ${result}`);
			}
			console.log("Login succeeded:", result);

			window.location.href = "/";
		} catch (err: any) {
			console.error(err);
			errorMsg.textContent = err ?? "Login failed";
			errorMsg.classList.remove("hidden");
		}
	});

	return outer;
}

function createRegistrationForm(): HTMLDivElement {

	const outer = document.createElement("div");
	const h1 = document.createElement("h1");
	const form = document.createElement("form");
	const text = document.createElement("input");
	const mail = document.createElement("input");
	const pass = document.createElement("input");
	const passConfirm = document.createElement("input");
	const p = document.createElement("p");
	const errorMsg = document.createElement("p");

	outer.id = "register-container";
	outer.classList = "w-1/3 items-center justify-center bg-gray-200 px-4 py-2 dark:bg-gray-950";
	outer.classList.add("hidden");

	h1.className = "mb-6 text-center text-2xl font-bold";
	h1.append("Register");

	form.id = "register-form";

	text.id = "username"
	text.type = "text";
	text.placeholder = "Username";
	text.className = "mb-4 w-full border p-2";

	mail.id = "email"
	mail.type = "email";
	mail.placeholder = "Email";
	mail.className = "mb-4 w-full border p-2";

	pass.id = "password";
	pass.type = "password";
	pass.minLength = 8;
	pass.placeholder = "Password";
	pass.className = "mb-2 w-full border p-2";

	passConfirm.id = "password-confirm";
	passConfirm.type = "password";
	passConfirm.minLength = 8;
	passConfirm.placeholder = "Confirm password";
	passConfirm.className = "mb-4 w-full border p-2";

	errorMsg.className = "text-red-600 mb-2 hidden";

	form.append(text, mail, pass, passConfirm, errorMsg, createButton({
		id: "register-button",
		buttonText: "Register",
		extraClasses: "w-full bg-blue-500 p-2 hover:bg-blue-600 dark:bg-blue-900 dark:hover:bg-blue-950 transition-color duration-200",
		type: "submit"
	}));

	p.className = "mt-4 text-center";
	p.append("Already have an account? ", createButton({
		id: "login-button",
		f: () => {
			const loginCont = document.getElementById("login-container");
			if (loginCont) {
				outer.classList.add("hidden");
				loginCont.classList.remove("hidden");
			}
		},
		buttonText: "Login.",
		extraClasses: "text-blue-500 underline hover:text-blue-700 transition-color duration-200",
		type: "button",
	}))

	outer.append(h1, form, p)

	form.addEventListener("submit", async (e) => {
		e.preventDefault()

		errorMsg.innerText = "";
		errorMsg.classList.add("hidden");

		if (text.classList.contains("border-red-500")) {
			text.classList.add("boder-gray-50");
			text.classList.remove("border-red-500");
		}

		if (pass.classList.contains("border-red-500")) {
			pass.classList.add("boder-gray-50");
			pass.classList.remove("border-red-500");
		}

		if (passConfirm.classList.contains("border-red-500")) {
			passConfirm.classList.add("boder-gray-50");
			passConfirm.classList.remove("border-red-500");
		}

		const payload = {
			username: text.value.trim(),
			email: mail.value.trim(),
			password: passConfirm.value,
		}

		try {
			if (text.value.trim().length === 0) {
				text.classList.remove("boder-gray-50");
				text.classList.add("border-red-500");
				throw new Error("Username field empty");
			} else if (mail.value.trim().length === 0) {
				mail.classList.remove("boder-gray-50");
				mail.classList.add("border-red-500");
				throw new Error("Email field empty");
			} else if (pass.value.trim().length === 0) {
				pass.classList.remove("boder-gray-50");
				pass.classList.add("border-red-500");
				throw new Error("A password field is empty");
			} else if (passConfirm.value.trim().length === 0) {
				passConfirm.classList.remove("boder-gray-50");
				passConfirm.classList.add("border-red-500");
				throw new Error("A password field is empty");
			} else if (pass.value != passConfirm.value) {
				pass.classList.remove("boder-gray-50");
				pass.classList.add("border-red-500");
				passConfirm.classList.remove("boder-gray-50");
				passConfirm.classList.add("border-red-500");
				throw new Error("Passwords do not match");
			}

			const result = await registerHandler(payload);
			if (result === 400) {
				throw new Error("Missing field(s) ot password < 8 chars");
			} else if (result === 409 ) {
				text.classList.remove("boder-gray-50");
				text.classList.add("border-red-500");
				mail.classList.remove("boder-gray-50");
				mail.classList.add("border-red-500");
				throw new Error("Username or email has already been used");
			} else if (result != 200) {
				throw new Error(`Unexpected error: ${result}`);
			}

			window.location.href = "/";
		} catch(err: any) {
			console.error(err);
			errorMsg.innerText = err ?? "Registration failed";
			errorMsg.classList.remove("hidden");
		}
	})

	return outer;
}


export default async function createLoginPage(): Promise<HTMLDivElement> {
	const outer = document.createElement("div");
	outer.className = "flex h-screen w-screen items-center justify-center";
	
	if (getItem("loggedIn") === true) {
		window.location.href = "/";
		return outer;
	}

	outer.append(createLoginForm(), createRegistrationForm());

	return outer;
}