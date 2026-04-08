import { createButton } from "../components/button/button";
import { renderError, renderMessage } from "../components/popup/popup";
import { API_BASE, authenticate, clearLoginInfo, redirectToLogin } from "../handler/loginHandler";
import { getLocalId } from "../helpers/apiHelper";
import { getLocalUserAvatar } from "../helpers/avatarHelper";
import { getItem, setItem } from "../helpers/localStoragehelper";
import { setLocale, t } from "../i18n/i18n";

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

	const headerAvatar = document.getElementById("header-user-pfp") as HTMLImageElement;

	const languageDropdownButton = document.getElementById("language-settings-button") as HTMLButtonElement;

	// Declaration of Functions
	async function uploadAvatar(file: File): Promise<string> {
		const form = new FormData();
		form.append("file", file);

		const resp = await fetch(`${API_BASE}/users/${getLocalId()}/avatar`, {
			method: "POST",
			credentials: "include",
			body: form
		});

		if (resp.status === 400) {
			throw `Failed to upload avatar: ${await resp.text()}`;
		} else if (resp.status === 403) {
			renderError(t("settings.notAllowed"));
			throw "403: Not allowed";
		} else if (resp.status === 404) {
			renderMessage(t("settings.userNotFound"));
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
			throw t("settings.noNewValues");

		const resp = await fetch(`${API_BASE}/users/${getLocalId()}`, {
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		})

		if (resp.ok) {
			setItem("username", username);
			setItem("email", email);
			return t("settings.infoUpdated");
		}
		else if (resp.status === 400) {
			throw new Error(`400: ${t("settings.errorInvalidFields")}`);
		} else if (resp.status === 403) {
			throw new Error(`403: ${t("settings.errorForbidden")}`);
		} else if (resp.status === 404) {
			throw new Error(`404: ${t("settings.errorTargetNotFound")}`);
		} else {
			throw new Error(`${resp.status}: ${t("settings.errorUnexpected")}`);
		}
	}

	async function updateLocale(locale: string): Promise<boolean> {
		// PATCH API call here

		return false;
	}

	async function deleteUser(): Promise<string> {
		const resp = await fetch(`${API_BASE}/users/${getLocalId()}`, {
			method: "DELETE",
			credentials: "include"
		});

		if (resp.ok) {
			return "200";
		} else if (resp.status === 403 || resp.status  === 404) {
			return `${t("settings.errorDeleteFailed")}: ${resp.status}`;
		} else {
			return `${t("settings.errorDeleteFailed")}: ${resp.status} (${t("settings.errorUnexpected")})`;
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
			buttonText: `▶ ${t("settings.updatePassword")}`
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
				setItem<string>("avatar_url", url);
				profileImg.classList.remove("dark:invert");
				if (avatarMsg) {
					if (!avatarMsg.classList.contains("text-green-600"))
						avatarMsg.classList.add("text-green-600")
					if (avatarMsg.classList.contains("text-red-600"))
						avatarMsg.classList.remove ("text-red-600");
					avatarMsg.innerText = t("settings.avatarUpdated");
				}
				if (headerAvatar)
					headerAvatar.src = url;
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
			buttonText: `▶ ${t("settings.saveChanges")}`
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

	const languageButtonClasses = [
		"w-full px-4 py-1 text-left cursor-pointer",
		"text-gray-800 dark:text-gray-100",
		"hover:bg-gray-300 dark:hover:bg-gray-600"
	].join(" ")
	
	if (languageDropdownButton) {
		const newLanguageButton = createButton({
			id: "language-settings-button",
			extraClasses: [
				"px-3 py-1.5 text-left cursor-pointer relative group",
				"bg-gray-100 dark:bg-gray-800",
				"hover:bg-gray-300 dark:hover:bg-gray-600",
				"text-gray-800 dark:text-gray-100",
				"border border-gray-400 dark:border-gray-500",
				"transition-colors duration-100"
			].join(" "),
			buttonText: `${getItem("locale") ?? "en"} ▾`
		});

		const languageDropDown = document.createElement("div");
		languageDropDown.className = [
			"flex flex-col w-full absolute left-0 top-full z-10",
			"invisible group-hover:visible",
			"bg-gray-100 dark:bg-gray-800",
			"border border-gray-400 dark:border-gray-500",
			"shadow-md"
		].join(" ");

		languageDropDown.append(
			createButton({
				id: "language-en-button",
				extraClasses: languageButtonClasses,
				buttonText: "en",
				f: () => {
					updateLocale("en");
					setLocale("en");
				}
			}),
			createButton({
				id: "language-fr-button",
				extraClasses: languageButtonClasses,
				buttonText: "fr",
				f: () =>  {
					updateLocale("fr");
					setLocale("fr");
				}
			})
		);

		newLanguageButton.append(languageDropDown);
		languageDropdownButton.replaceWith(newLanguageButton);
	}

	const redButtonClasses = [
		"w-full mb:w-2/3 py-2 mt-2",
		"bg-red-400 dark:bg-red-800",
		"hover:bg-red-500 hover:dark:bg-red-700",
		"active:brightness-95 dark:active:brightness-110",
		"transition-colors duration-100"
	].join(" ");
	
	if (deleteButton) {

		deleteButton.replaceWith(createButton({
			id: "deleteButton",
			extraClasses: redButtonClasses,
			buttonText: t("settings.deleteAccountButton"),
			f: () => {confirmationDiv.classList.remove("hidden")}
		}));

		confirmationButton.replaceWith(createButton({
			id: "confirmationButton",
			extraClasses: redButtonClasses,
			buttonText: t("settings.deleteAccountConfirmed"),
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