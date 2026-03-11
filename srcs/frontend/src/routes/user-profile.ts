export default function buildUserProfile(): HTMLDivElement {
	const thClasses = "py-2 px-4 border-b";
	
	const outer = document.createElement("div");
	outer.className = "flex flex-1";
	outer.innerHTML = `
		<section class="w-1/3 h-full">
			<div class="flex flex-col items-center space-x-4 pt-10">
				<img id="pfp" src="assets/images/user-svgrepo-com.svg" alt="avatar" class="w-20 h-20">
				<h1 id="username" class="text-2xl font-bold"></h1>
			</div>
		</section>

		<section class="w-2/3 h-full flex flex-col">
			<div class="flex flex-col mt-4">
				<h2 class="text-xl mb-2">User Stats</h2>
				<div id="userStats" class="w-5/6 grid grid-cols-2 gap-4">
				</div>
			</div>
			<div class="mt-6">
				<h2 class="text-xl mb-2">Match History</h2>
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
	console.log(outer.innerHTML);

	return outer;
}
