import { createButton } from "../components/button/button";
import { renderError, renderMessage } from "../components/popup/popup";
import { getLocalId } from "../helpers/apiHelper";
import { getLocalUserAvatar } from "../helpers/avatarHelper";
import { setItem } from "../helpers/localStoragehelper";

export default function initUSerSettings(): void {

	// Initialisation of document elements
	const submitPass = document.getElementById("submitPass");

	const avatarInput = document.getElementById("avatarInput") as HTMLInputElement;
	const profileImg = document.getElementById("profileImg") as HTMLImageElement;
	const avatarMsg = document.getElementById("avatarMsg") as HTMLParagraphElement;


	// Declaration of Functions
	async function uploadAvatar(file: File): Promise<string> {
		const form = new FormData();
		form.append("file", file);

		const resp = await fetch(`/users/${getLocalId}/avatar`, {
			method: "POST",
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

	// Function Propper
	if (submitPass) {
		submitPass.replaceWith(createButton({
			id: "submitPass",
			type: "submit",
			extraClasses: "w-full py-2 px-4 bg-blue-500 dark:bg-blue-900 text-white rounded-md hover:bg-blue-600 hover:dark:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500",
			buttonText: "Update Password"
		}));
	}

	if (profileImg)
		profileImg.src = getLocalUserAvatar();

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


}