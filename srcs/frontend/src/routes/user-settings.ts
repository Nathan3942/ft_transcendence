import { getLocalUserAvatar } from "../helpers/avatarHelper";
import { getItem } from "../helpers/localStoragehelper";

export default async function createUserSettingsPage(): Promise<HTMLDivElement> {
	const outer = document.createElement("div");
	outer.className = "flex flex-1 flex-col"
	outer.innerHTML = `
		<h2 class="text-2xl font-semibold mt-4 ml-2">User Settings</h2>

		<section class="flex items-center mt-10 ml-6 w-1/3">
			<div class="relative mr-2 w-24 h-24 overflow-hidden bg-gray-100 dark:bg-gray-700">
				<img id="profileImg" src="${getLocalUserAvatar()}" alt="Profile picture"
					class="w-full h-full object-cover"/>
				<label for="avatarInput"
					class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 bg-opacity-30 opacity-0 hover:opacity-100 cursor-pointer transition">
				<img id="upArrow" src="/assets/images/arrow-up-arrow-indicator-chevron-anchor-point-svgrepo-com.svg"
					class="w-1/2 h-1/2 dark:invert">
				</label>
				<input type="file" id="avatarInput" accept="image/*" class="hidden"/>
			</div>
			<div id="avatarMsg"><p class="text-sm">Click the picture to upload a new avatar.</p></div>
		</section>

		<section class="mt-10 ml-6 w-1/3">
			<form id="userInfoForm" class="space-y-4">
				<div>
					<label class="block text-sm">Username</label>
					<input type="username" required id="usernameInput" value=${getItem("username")}
						class="text-lg mt-1 block w-full border border-gray-300 dark:border-gray-500 shadow-sm">
				</div>

				<div>
					<label class="block text-sm mt-2">Email</label>
					<input type="email" required id="emailInput" value=${getItem("username")}
						class="text-lg mt-1 block w-full border border-gray-300 dark:border-gray-500 shadow-sm">
				</div>

				<div class="mt-4 flex space-x-2">
					<button id="submitInfoChange" type="submit">
				</div>
				<p id="userInfoText"></p>
			</form>
		</section>

		<section class="mt-10 ml-6 w-1/3">
			<h3 class="text-lg font-medium">Change Password</h3>

			<form id="pwdForm" class="space-y-4">
				<div>
				<label for="currentPwd" class="block text-sm pl-1">Current password</label>
				<input type="password" id="currentPwd" required
						class="text-lg mt-1 block w-full border border-gray-300 dark:border-gray-500 shadow-sm"/>
				</div>

				<div>
				<label for="newPwd" class="block text-sm pl-1">New password</label>
				<input type="password" id="newPwd" required minlength="8"
						class="text-lg mt-1 block w-full border border-gray-300 dark:border-gray-500 shadow-sm"/>
				</div>

				<div>
				<label for="confirmPwd" class="block text-sm pl-1">Confirm new password</label>
				<input type="password" id="confirmPwd" required minlength="8"
					class="text-lg mt-1 block w-full border border-gray-300 dark:border-gray-500 shadow-sm"/>
				</div>

				<button id="submitPass" type="submit">
				</button>
			</form>

			<p id="errorMsg" class="text-sm"></p>
		</section>
  `;

	return outer;
}

