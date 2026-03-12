export default function buildUserProfile(): HTMLDivElement {
	const thClasses = "py-2 px-4 border-b";
	const h2Classes = "w-full font-bold mb-2 border text-center";

	const outer = document.createElement("div");
	outer.className = "flex flex-1";
	outer.innerHTML = `
		<section class="w-1/3 h-full">
			<div class="flex flex-col items-center pt-10">
				<img id="profilePfp" src="assets/images/user-svgrepo-com.svg" alt="avatar" class="w-20 h-20">
				<h1 id="profileUsername" class="text-2xl font-bold pt-3"></h1>
				<p id="onlineStatus" class="pt-2"></p>
			</div>
		</section>

		<section class="w-2/3 h-full flex flex-col">
			<div class="flex flex-col mt-4">
				<h2 class="text-xl font-bold mb-2">User Stats</h2>
				<div id="userStats" class="w-5/6 grid grid-cols-4 gap-6">
					<div class="flex flex-col items-center">
						<h2 class="${h2Classes}">Total Matches</h2>
						<p id="totalMatches"></p>
					</div>
					<div class="flex flex-col items-center">
						<h2 class="${h2Classes}">Tournaments Won</h2>
						<p id="tournamentsWon"></p>
					</div>
					<div class="relative">
						<svg class="w-full h-full" viewBox="0 0 100 100">
							<circle
								class="text-red-500 stroke-current"
								stroke-width="10"
								cx="50"
								cy="50"
								r="40"
								fill="transparent"
							></circle>
							<circle
								id="winCircle"
								class="text-green-500 stroke-current"
								stroke-width="10"
								stroke-linecap=""
								cx="50"
								cy="50"
								r="40"
								fill="transparent"
								stroke-dasharray="251.2"
								stroke-dashoffset="251.2"
							></circle>
						</svg>
						<div class="absolute inset-0 flex items-center justify-center">
							<span id="winrate" class="text-2xl font-bold underline"></span>
						</div>
					</div>
					<div class="flex flex-col justify-evenly w-full mt-4">
						<div class="flex flex-row">
							<p class="pr-1">Wins:</p>
							<p id="wins" class="font-bold"></p>
						</div>
						<div class="flex flex-row">
							<p class="pr-1">Losses:</p>
							<p id="losses" class="font-bold"></p>
						</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-6">
				<h2 class="text-xl font-bold mb-2">Match History</h2>
				<table id="matchHistory" class="w-5/6">
					<thead>
						<tr>
							<th class="${thClasses}">Match ID</th>
							<th class="${thClasses}">Opponent</th>
							<th class="${thClasses}">Score</th>
							<th class="${thClasses}">Result</th>
							<th class="${thClasses}">Date</th>
						</tr>
					</thead>
					<tbody>
					</tbody>
				</table>
			</div>
		</section>
	`

	return outer;
}
