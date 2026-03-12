import { createButton } from "../components/button/button";
import { renderError, renderMessage } from "../components/popup/popup";
import { API_BASE, authenticate } from "../handler/loginHandler";
import { getLocalId } from "../helpers/apiHelper";
import { getLocalUserAvatar } from "../helpers/avatarHelper";
import { getItem, setItem } from "../helpers/localStoragehelper";

export default function initUSerSettings(): void {

	// Initialisation of document elements
	const submitPass = document.getElementById("submitPass");
	const submitInfoChange = document.getElementById("submitInfoChange");

	const avatarInput = document.getElementById("avatarInput") as HTMLInputElement;
	const profileImg = document.getElementById("profileImg") as HTMLImageElement;
	const avatarMsg = document.getElementById("avatarMsg") as HTMLParagraphElement;

	const userInfoForm = document.getElementById("userInfoForm") as HTMLFormElement;
	const usernameInput = document.getElementById("usernameInput") as HTMLInputElement;
	const emailInput = document.getElementById("emailInput") as HTMLInputElement;
	const userInfoText = document.getElementById("userInfoText") as HTMLParagraphElement;

	// Declaration of Functions
	async function uploadAvatar(file: File): Promise<string> {
		const form = new FormData();
		form.append("file", file);

		const resp = await fetch(`${API_BASE}/users/${getLocalId}/avatar`, {
			method: "POST",
			credentials: "include",
			body: form
		});

		if (resp.status === 400) {
			throw `Failed to upload avatar: ${await resp.text()}`;
		} else if (resp.status === 403) {
			renderError("You are not allowed to perform this action, if you think this is a mistake, clear your cache with 'ctrl + shift + r' and log back in");
			throw "403: Not allowed";
		} else if (resp.status === 404 && resp.text.length === 0) {
			renderMessage("You appear to be offline. Please try again later");
			throw "You are offline, please try again later";
		} else if (resp.status === 404) {
			renderMessage("The requested user was not found");
			throw "404: Not Found";
		}

		if (!resp.ok) {
			console.error(`unexpected error: ${resp.status}`);
			throw `Unexpected error: ${resp.status}`;
		}

		// setItem("avatarUrl", await resp.text());
		return await resp.text();
	}

	async function updateUserInfo(): Promise<string> {
		const username = usernameInput.value;
		const email = emailInput.value;
		
		authenticate();

		const form = new FormData();
		if (username != getItem<string>("username"))
			form.append("username", username);
		if (email != getItem<string>("email"))
			form.append("email", email);

		if (!form.has("email") || !form.has("username"))
			throw "You have not entered any new values";

		const resp = await fetch(`${API_BASE}/users/${getLocalId}}`, {
			method: "PATCH",
			credentials: "include",
			body: form
		})

		if (resp.ok) {
			setItem("username", username);
			setItem("email", email);
			return "Information updated sucessfully";
		}
		else if (resp.status === 400) {
			throw new Error("400: Invalid fields");
		} else if (resp.status === 403) {
			throw new Error("403: You dont have the permissions to modify this data");
		} else if (resp.status === 404 && resp.text.length === 0) {
			renderMessage("You appear to be offline. Please try again later");
			throw new Error("You are offline, please try again later");
		} else if (resp.status === 404) {
			throw new Error("404: the specified user you tried to modify does not exist");
		} else {
			throw new Error(`${resp.status}: Unexpected error`);
		}
	}

	// Function Propper
	if (submitPass) {
		submitPass.replaceWith(createButton({
			id: "submitPass",
			type: "submit",
			extraClasses: "w-full py-2 px-4 bg-blue-500 dark:bg-blue-900 text-white rounded-md hover:bg-blue-600 hover:dark:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500",
			buttonText: "Update Password"
		}));
	}

	if (avatarInput && profileImg) {
		avatarInput.addEventListener("change", async () => {
			const file = avatarInput.files?.[0];
			if (!file)
				return ;
			const url = URL.createObjectURL(file);
			profileImg.src = url;
			try {
				const savedUrl = await uploadAvatar(file);
				profileImg.src = url;
				URL.revokeObjectURL(url);
				setItem<string>("avatarUrl", savedUrl);
				profileImg.classList.remove("dark:invert");
				if (avatarMsg) {
					if (!avatarMsg.classList.contains("text-green-600"))
						avatarMsg.classList.add("text-green-600")
					if (avatarMsg.classList.contains("text-red-600"))
						avatarMsg.classList.remove ("text-red-600");
					avatarMsg.innerText = "Avatar Updated sucessfully";
				}
			} catch (e) {
				profileImg.src = getLocalUserAvatar();
				console.error(e);
				if (avatarMsg) {
					if (!avatarMsg.classList.contains("text-red-600"))
						avatarMsg.classList.add ("text-red-600");
					if (avatarMsg.classList.contains("text-green-600"))
						avatarMsg.classList.remove("text-green-600")
					avatarMsg.innerText = e as string;
				}
			}
		});
	}

	if (submitInfoChange) {
		submitInfoChange.replaceWith(createButton({
			id: "submitInfoChange",
			type: "submit",
			extraClasses: "w-full py-2 px-4 bg-blue-500 dark:bg-blue-900 text-white rounded-md hover:bg-blue-600 hover:dark:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500",
			buttonText: "Update Information"
		}));
	}
	
	if (userInfoForm) {
		userInfoForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			
			try {
				const txt = await updateUserInfo();
				if (!avatarMsg.classList.contains("text-green-600"))
					userInfoText.classList.add("text-green-600");
				if (avatarMsg.classList.contains("text-red-600"))
					userInfoText.classList.remove("text-red-600");
				userInfoText.innerText = txt;
			} catch (e) {
				console.error(`Failed to update user info: ${e}`);
				if (!avatarMsg.classList.contains("text-red-600"))
					userInfoText.classList.add("text-red-600");
				if (avatarMsg.classList.contains("text-green-600"))
					userInfoText.classList.remove("text-green-600");
				userInfoText.innerText = `${e}` ;
			}
		})
	}

}