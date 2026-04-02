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
	outer.className = "flex flex-1 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-4";
	outer.innerHTML = `
		<section class="w-1/6 h-full flex flex-col items-center pt-10 border-r border-gray-200 dark:border-gray-700 pr-4">
			<img id="profilePfp" src="assets/images/user-svgrepo-com.svg" alt="avatar" class="w-20 h-20 border-2 border-gray-300 dark:border-gray-700">
			<h1 id="profileUsername" class="text-2xl font-bold pt-3"></h1>
			<p id="userIdDisplay" class="pt-2 text-gray-500 dark:text-gray-400">ID: </p>
			<p id="onlineStatus" class="pt-2 text-gray-500 dark:text-gray-400"></p>
		</section>
		<section class="w-5/6 h-full flex flex-col pl-4">
			<div class="flex flex-col mt-4">
				<h2 class="text-xl font-bold mb-2 text-gray-800 dark:text-white">▐ User Stats</h2>
				<div id="userStats" class="w-full grid grid-cols-4 gap-4">
					<div class="${statBoxClasses}">
						<h2 class="${h2Classes}">Total Matches</h2>
						<p id="totalMatches" class="text-3xl"></p>
					</div>
					<div class="${statBoxClasses}">
						<h2 class="${h2Classes}">Tournaments Won</h2>
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
							<p class="pr-1 text-gray-600 dark:text-gray-300">Wins:</p>
							<p id="wins" class="font-bold"></p>
						</div>
						<div class="flex flex-row justify-center">
							<p class="pr-1 text-gray-600 dark:text-gray-300">Losses:</p>
							<p id="losses" class="font-bold"></p>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-6 flex-1 overflow-y-auto">
				<h2 class="text-xl font-bold mb-2 text-gray-800 dark:text-white">▐ Match History</h2>
				<table id="matchHistory" class="w-full border border-gray-200 dark:border-gray-700">
					<thead>
						<tr>
							<th class="${thClasses}">Match ID</th>
							<th class="${thClasses}">Opponent</th>
							<th class="${thClasses}">Score</th>
							<th class="${thClasses}">Result</th>
							<th class="${thClasses}">Date</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
			</div>
		</section>
	`;
	return outer;
}