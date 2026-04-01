import { createButton } from "../components/button/button";
import { renderError, renderMessage } from "../components/popup/popup";
import { API_BASE, authenticate, clearLoginInfo, redirectToLogin } from "../handler/loginHandler";
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

	const deleteButton = document.getElementById("deleteButton") as HTMLButtonElement;
	const confirmationDiv = document.getElementById("confirmationDiv") as HTMLDivElement;
	const confirmationButton = document.getElementById("confirmationButton") as HTMLButtonElement;
	const deleteStatus = document.getElementById("deleteStatus") as HTMLParagraphElement;

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

		const payload: Record<string, string> = {};
		if (username != getItem<string>("username"))
			payload["username"] = username;
		if (email != getItem<string>("email"))
			payload["email"] = email;

		if (!payload["email"] && !payload["username"])
			throw "You have not entered any new values";

		const resp = await fetch(`${API_BASE}/users/${getLocalId()}`, {
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
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
		} else if (resp.status === 404 && (await resp.text).length === 0) {
			renderMessage("You appear to be offline. Please try again later");
			throw new Error("You are offline, please try again later");
		} else if (resp.status === 404) {
			throw new Error("404: the specified user you tried to modify does not exist");
		} else {
			throw new Error(`${resp.status}: Unexpected error`);
		}
	}

	async function deleteUser(): Promise<string> {
		const resp = await fetch(`${API_BASE}/users/${getLocalId}`, {
			method: "DELETE",
			credentials: "include"
		});

		if (resp.ok) {
			return "200";
		} else if (resp.status === 404 && resp.text.length === 0) {
			console.error("Error 404: You appear to be offline, please try again later");
			renderMessage("You appear to be offline, please try again later.");
			return "You appear to be offline, please try again later.";
		} else if (resp.status === 403 || resp.status  === 404) {
			return `Error: ${resp.text}: ${resp.text}`;
		} else {
			return `Error: Unexpected Error: ${resp.status}: ${resp.text}`;
		}
		
	}

	// Function Propper
	
	const buttonClasses = [
		"w-full py-2 mt-2",
		"bg-blue-400 dark:bg-blue-800",
		"hover:bg-blue-500 hover:dark:bg-blue-700",
		"active:brightness-95 dark:active:brightness-110",
		"transition-colors duration-100"
	].join(" ")
	
	if (submitPass) {
		submitPass.replaceWith(createButton({
			id: "submitPass",
			type: "submit",
			extraClasses: buttonClasses,
			buttonText: "▶ Update Password"
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
			extraClasses: buttonClasses,
			buttonText: "▶ Save Changes"
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

	const redButtonClasses = [
		"w-1/3 py-2 mt-2",
		"bg-red-400 dark:bg-red-800",
		"hover:bg-red-500 hover:dark:bg-red-700",
		"active:brightness-95 dark:active:brightness-110",
		"transition-colors duration-100"
	].join(" ")

	if (deleteButton) {

		deleteButton.replaceWith(createButton({
			id: "deleteButton",
			extraClasses: redButtonClasses,
			buttonText: "Delete Account?",
			f: () => {confirmationDiv.classList.remove("hidden")}
		}));

		confirmationButton.replaceWith(createButton({
			id: "confirmationButton",
			extraClasses: redButtonClasses,
			buttonText: "Im sure, Delete my account",
			f: async () => {
				const resp = await deleteUser();
				if (resp === "200") {
					console.log("Sucessfully deleted user account");
					clearLoginInfo();
					redirectToLogin();
				} else {
					console.error(resp);
					deleteStatus.innerText = resp;
				}
			}
		}))
	}

}