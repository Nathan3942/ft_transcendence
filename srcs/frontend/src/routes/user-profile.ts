import { t } from "../i18n/i18n";

export default function buildUserProfile(): HTMLDivElement {
	const thClasses = [
		"py-2 px-4",
		"border-b border-gray-200 dark:border-gray-700",
		"bg-gray-100 dark:bg-gray-800",
		"text-gray-800 dark:text-white"
	].join(" ");

	const h2Classes = [
		"w-full mb-2",
		"border border-gray-200 dark:border-gray-700",
		"bg-gray-100 dark:bg-gray-800",
		"font-bold text-gray-800 dark:text-white text-center"
	].join(" ");

	const statBoxClasses = [
		"p-2",
		"border border-gray-200 dark:border-gray-700",
		"bg-gray-100 dark:bg-gray-800",
		"rounded-sm",
		"text-gray-800 dark:text-white text-center"

	].join(" ");

	const outer = document.createElement("div");
	outer.className = "overflow-y-auto md:overflow-hidden flex flex-1 md:flex-row flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-4";
	outer.innerHTML = `
		<section class="w-full md:w-1/6 pb-4 md:pb-0 md:pr-4 flex md:flex-col flex-row items-center pt-4 md:pt-10 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
			<img id="profilePfp" src="assets/images/user-svgrepo-com.svg" alt="avatar" class="w-24 md:w-40 aspect-square shrink-0 border-2 border-gray-300 dark:border-gray-700">
			<div class="pl-4 md:pl-0 flex flex-col md:items-center">
				<h1 id="profileUsername" class="text-2xl font-bold md:pt-3"></h1>
				<p id="userIdDisplay" class="pt-1 md:pt-2 text-gray-500 dark:text-gray-400">ID: </p>
				<p id="onlineStatus" class="pt-1 md:pt-2"></p>
			</div>
		</section>
		<section class="w-full md:w-5/6 flex flex-col md:pl-4 pt-4 md:pt-0 md:overflow-y-auto">
			<div class="flex flex-col mt-4">
				<h2 class="text-xl font-bold mb-2 text-gray-800 dark:text-white">▐ ${t("profile.userStats")}</h2>
				<div id="userStats" class="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
					<div class="${statBoxClasses}">
						<h2 class="${h2Classes}">${t("profile.totalMatches")}</h2>
						<p id="totalMatches" class="text-3xl"></p>
					</div>
					<div class="${statBoxClasses}">
						<h2 class="${h2Classes}">${t("profile.tournamentsWon")}</h2>
						<p id="tournamentsWon" class="text-3xl"></p>
					</div>
					<div class="${statBoxClasses} relative">
						<svg class="w-full h-full" viewBox="0 0 100 100">
							<circle
								id="lossCircle"
								class="text-red-500 stroke-current"
								stroke-width="10"
								cx="50"
								cy="50"
								r="40"
								fill="transparent"
								stroke-dasharray="251.2"
								stroke-dashoffset="0"
							></circle>
							<circle
								id="winCircle"
								class="text-green-500 stroke-current"
								stroke-width="10"
								cx="50"
								cy="50"
								r="40"
								fill="transparent"
								stroke-dasharray="251.2"
								stroke-dashoffset="251.2"
							></circle>
						</svg>
						<div class="absolute inset-0 flex items-center justify-center">
							<span id="winrate" class="text-2xl font-bold"></span>
						</div>
					</div>
					<div class="${statBoxClasses} flex flex-col justify-evenly">
						<div class="flex flex-row justify-center">
							<p class="pr-1 text-gray-600 dark:text-gray-300">${t("profile.wins")}:</p>
							<p id="wins" class="font-bold"></p>
						</div>
						<div class="flex flex-row justify-center">
							<p class="pr-1 text-gray-600 dark:text-gray-300">${t("profile.losses")}:</p>
							<p id="losses" class="font-bold"></p>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-4">
				<h2 class="text-xl font-bold mb-2 text-gray-800 dark:text-white">▐ ${t("profile.recentForm")}</h2>
				<div id="recentForm" class="flex gap-2"></div>
			</div>
			<div class="mt-6">
				<h2 class="text-xl font-bold mb-2 text-gray-800 dark:text-white">▐ ${t("profile.matchHistory")}</h2>
				<div class="overflow-x-auto">
					<table id="matchHistory" class="w-full border border-gray-200 dark:border-gray-700">
						<thead>
							<tr>
								<th class="${thClasses} hidden md:table-cell">${t("profile.matchId")}</th>
								<th class="${thClasses}">${t("profile.opponent")}</th>
								<th class="${thClasses}">${t("profile.score")}</th>
								<th class="${thClasses}">${t("profile.result")}</th>
								<th class="${thClasses}">${t("profile.date")}</th>
							</tr>
						</thead>
						<tbody></tbody>
					</table>
				</div>
			</div>
		</section>
	`;
	return outer;
}