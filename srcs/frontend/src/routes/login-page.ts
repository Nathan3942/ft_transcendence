import { createButton } from "../components/button/button";
import { loginHandler, registerHandler } from "../handler/loginHandler";

function createLoginForm(formContainer: Element) {

	const outer = document.createElement("div");
	const form = document.createElement("form");
	const textInput = document.createElement("input");
	const passInput = document.createElement("input"); 
	const h1 = document.createElement("h1");
	const p = document.createElement("p");
	const errorMsg = document.createElement("p");
	
	h1.className = "mb-6 text-center text-2xl font-bold";
	h1.append("Login");
	
	form.id = "login-form"

	textInput.type = "text";
	textInput.placeholder = "Username";
	textInput.className = "mb-2 w-full border p-2";

	passInput.type = "password";
	passInput.placeholder = "Password";
	passInput.className = "mb-4 w-full border p-2";

	errorMsg.className = "text-red-600 mb-2 hidden";

	form.append(textInput, passInput, errorMsg, createButton({
		id: "login-button",
		buttonText: "Login",
		extraClasses: "w-full bg-blue-500 p-2 hover:bg-blue-600 dark:bg-blue-900 dark:hover:bg-blue-950",
		type: "submit"
	}));

	p.className = "mt-4 text-center";
	p.append("Don't have an account? ", createButton({
		id: "register-button",
		f: () => {
			if (formContainer) {
				createRegistrationForm(formContainer);
			}
		},
		buttonText: "Register.",
		extraClasses: "text-blue-500 underline hover:text-blue-700",
		type: "button"
	}));
	
	outer.append(h1, form, p);

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		errorMsg.textContent = "";
		errorMsg.classList.add("hidden");

		const payload = {
			username: textInput.value.trim(),
			password: passInput.value
		};

		try {
			if (payload.username.length === 0)
				throw new Error("Username field empty");
			else if (payload.password.trim().length === 0)
				throw new Error("Password field empty");
			
			const result = await loginHandler(payload);
			console.log("Login succeeded:", result);

			window.location.href = "/dashboard";
		} catch (err: any) {
			console.error(err);
			errorMsg.textContent = err ?? "Login failed";
			errorMsg.classList.remove("hidden");
		}
	});

	formContainer.innerHTML = "";
	formContainer.append(outer);
}

function createRegistrationForm(formContainer: Element) {

	const outer = document.createElement("div");
	const h1 = document.createElement("h1");
	const form = document.createElement("form");
	const text = document.createElement("input");
	const pass = document.createElement("input");
	const passConfirm = document.createElement("input");
	const p = document.createElement("p");
	const errorMsg = document.createElement("p");

	h1.className = "mb-6 text-center text-2xl font-bold";
	h1.append("Register");

	form.id = "register-form";

	text.id = "username"
	text.type = "text";
	text.placeholder = "Username";
	text.className = "mb-4 w-full border p-2";

	pass.id = "password";
	pass.type = "password";
	pass.placeholder = "Password";
	pass.className = "mb-2 w-full border p-2";

	passConfirm.id = "password-confirm";
	passConfirm.type = "password";
	passConfirm.placeholder = "Confirm password";
	passConfirm.className = "mb-4 w-full border p-2";

	errorMsg.className = "text-red-600 mb-2 hidden";

	form.append(text, pass, passConfirm, errorMsg, createButton({
		id: "register-button",
		buttonText: "Register",
		extraClasses: "w-full bg-blue-500 p-2 hover:bg-blue-600 dark:bg-blue-900 dark:hover:bg-blue-950",
		type: "submit"
	}));

	p.className = "mt-4 text-center";
	p.append("Already have an account? ", createButton({
		id: "login-button",
		f: () => {
			if (formContainer) {
				createLoginForm(formContainer);
			}
		},
		buttonText: "Login.",
		extraClasses: "text-blue-500 underline hover:text-blue-700",
		type: "button",
	}))

	outer.append(h1, form, p)

	form.addEventListener("submit", async (e) => {
		e.preventDefault()

		console.log("im here");

		errorMsg.innerText = "";
		errorMsg.classList.add("hidden");

		const payload = {
			username: text.value.trim(),
			password: passConfirm.value,
		}

		try {
			if (text.value.trim().length === 0)
				throw new Error("Username field empty");
			else if (pass.value.trim().length === 0 || passConfirm.value.trim().length === 0)
				throw new Error("A password field is empty");
			else if (pass.value != passConfirm.value)
				throw new Error("Passwords do not match");

			await registerHandler(payload);

			window.location.href = "/dashboard";
		} catch(err: any) {
			console.log(err);
			errorMsg.innerText = err ?? "Registration failed";
			errorMsg.classList.remove("hidden");
		}
	})

	formContainer.innerHTML = "";
	formContainer.append(outer);
}


export default function createLoginPage(): HTMLDivElement {
	const outer = document.createElement("div");
	const formContainer  = document.createElement("div");

	outer.className = "flex h-screen w-screen items-center justify-center";

	formContainer.id = "form-container";
	formContainer.className = "w-1/3 items-center justify-center bg-gray-200 px-4 py-2 dark:bg-gray-950"
	createLoginForm(formContainer); 

	outer.append(formContainer);

	return outer;
}