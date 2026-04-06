import { getLocalUserAvatar } from "../helpers/avatarHelper";
import { getItem } from "../helpers/localStoragehelper";
import { t } from "../i18n/i18n";

export default function createUserSettingsPage(): HTMLDivElement {
	const outer = document.createElement("div");
	outer.className = "overflow-y-auto flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white";

	const sectionClasses = "mt-8 mx-4 md:ml-6 md:mr-0 md:w-5/6";
	const inputClasses = [
		"mt-1 w-full px-3 py-2",
		"bg-white dark:bg-gray-800",
		"text-gray-900 dark:text-white text-base",
		"border-2 border-gray-400 dark:border-gray-500",
		"focus:outline-none focus:border-green-500 dark:focus:border-green-400",
		"placeholder-gray-400 dark:placeholder-gray-500",
		"rounded-none"
	].join(" ");

	const labelClasses = "block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1";

	outer.innerHTML = `
		<div class="px-4 md:pl-6 pt-8 flex items-center gap-3">
			<span class="font-mono font-black text-xl tracking-tight uppercase text-gray-900 dark:text-white animate-blink">
				▐ ${t("settings.title")}</span>
		</div>

		<section class="flex flex-1 flex-col md:flex-row">

			<section class="flex flex-col w-full md:w-3/8">
			
				<section class="${sectionClasses}">
					<p class="${labelClasses}">${t("settings.avatar")}</p>
					<div class="flex items-center gap-4">
						<div class="relative w-40 h-40 border-2 border-gray-400 dark:border-gray-500 overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
							<img id="profileImg" src="${getLocalUserAvatar()}" alt="Profile picture"
								class="w-full h-full object-cover"/>
							<label for="avatarInput"
								class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 opacity-0 hover:opacity-100 cursor-pointer transition-all duration-150">
								<img id="upArrow"
									src="/assets/images/arrow-up-arrow-indicator-chevron-anchor-point-svgrepo-com.svg"
									class="w-8 h-8 invert">
							</label>
							<input type="file" id="avatarInput" accept="image/*" class="hidden"/>
						</div>
						<div id="avatarMsg" class="font-mono text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
							${t("settings.avatarMessage")}
						</div>
					</div>
				</section>

				<div class="mt-8 mx-4 md:ml-6 md:mr-0 md:w-5/6 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>

				<section class="${sectionClasses}">
					<p class="${labelClasses} text-base mb-3">▸ ${t("settings.profileInfo")}</p>
					<form id="userInfoForm" class="space-y-4">
						<div>
							<label class="${labelClasses}" for="usernameInput">${t("settings.username")}</label>
							<input type="text" required id="usernameInput" placeholder="John Doe" value="${getItem("username") ?? ""}"
								class="${inputClasses}"/>
						</div>
						<div>
							<label class="${labelClasses}" for="emailInput">${t("settings.email")}</label>
							<input type="email" required id="emailInput" placeholder="john.doe@example.com" value="${getItem("email") ?? ""}"
								class="${inputClasses}"/>
						</div>
						<div class="pt-2">
							<button id="submitInfoChange">
							</button>
						</div>
						<p id="userInfoText" class="font-mono text-xs text-green-600 dark:text-green-400 min-h-4"></p>
					</form>
				</section>

				<div class="mt-8 mx-4 md:ml-6 md:mr-0 md:w-5/6 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>

				<section class="${sectionClasses} mb-12">
					<p class="${labelClasses} text-base mb-3">▸ ${t("settings.changePassword")}</p>
					<form id="pwdForm" class="space-y-4">
						<div>
							<label for="currentPwd" class="${labelClasses}">${t("settings.currentPassword")}</label>
							<input type="password" id="currentPwd" required
								class="${inputClasses}"/>
						</div>
						<div>
							<label for="newPwd" class="${labelClasses}">${t("settings.newPassword")}</label>
							<input type="password" id="newPwd" required minlength="8"
								class="${inputClasses}"/>
						</div>
						<div>
							<label for="confirmPwd" class="${labelClasses}">${t("settings.confirmPassword")}</label>
							<input type="password" id="confirmPwd" required minlength="8"
								class="${inputClasses}"/>
						</div>
						<div class="pt-2">
							<button id="submitPass">
							</button>
						</div>
					</form>
					<p id="errorMsg" class="font-mono text-xs text-red-500 dark:text-red-400 mt-2 min-h-4"></p>
				</section>

			</section>
			
			<section class="flex flex-col w-full md:w-3/8">

				<section class="${sectionClasses}">
					<p class="${labelClasses} text-base mb-3">▸ ${t("settings.language")}</p>
					<button id="language-settings-button" class="relative group">
						<div id="language-dropdown" class="flex flex-col items-start invisible opacity-0 absolute left-0 mt-1 bg-gray-200 dark:bg-gray-700 shadow-lg py-1 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 z-10">
						</div>
					</button>
				</section>

				<div class="mt-8 mx-4 md:ml-6 md:mr-0 md:w-5/6 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>

				<section class="${sectionClasses} mb-12">
					<p class="${labelClasses} text-base mb-3">▸ ${t("settings.dangerZone")}</p>
					<p class="${labelClasses}">${t("settings.deleteAccount")}</p>
					<button id="deleteButton"></button>
					<div id="confirmationDiv" class="hidden">
						<p class="text-orange-500 mt-5">${t("settings.deleteAccountConfirmation1")}
						<br><span class="font-bold">${t("settings.deleteAccountConfirmation2")}</span></p>
						<button id="confirmationButton"></button>
						<p id="deleteStatus" class="w-2/3 mt-3 text-red-500"></p>
					</div>
				</section>

			</section>
	
		</section
	`;

	return outer;
}