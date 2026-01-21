export default function createHomePage(): HTMLDivElement {

	const template = document.createElement("template");
	template.innerHTML = `
		<div class="flex flex-1 flex-col justify-center items-end">
			<div class="text-3xl w-9/12 h-2/3 flex flex-col items-end justify-between">
				<div class="w-11/12 hover:w-full flex flex-row p-4 bg-blue-300 dark:bg-blue-900 hover:brightness-90 dark:hover:brightness-130">
					<img src="assets/images/monitor-svgrepo-com.svg" alt="Icon" class="h-10 pr-2 dark:invert">
					<button class="">Local Play</button>
				</div>
				<div class="w-11/12 hover:w-full flex flex-row p-4 bg-green-300 dark:bg-green-900 hover:brightness-90 dark:hover:brightness-130">
					<img src="assets/images/globe-svgrepo-com.svg" alt="Icon" class="h-10 pr-2 dark:invert">
					<button class="">Online Play</button>
				</div>
				<div class="w-11/12 hover:w-full flex flex-row p-4 bg-red-300 dark:bg-red-900 hover:brightness-90 dark:hover:brightness-130">
					<img src="assets/images/square-poll-vertical-svgrepo-com.svg" alt="Icon" class="h-10 pr-2 dark:invert">
					<button class="">Leaderboard</button>
				</div>
				<div class="w-11/12 hover:w-full flex flex-row p-4 bg-purple-300 dark:bg-purple-900 hover:brightness-90 dark:hover:brightness-130">
					<img src="assets/images/circle-information-svgrepo-com.svg" alt="Icon" class="h-10 pr-2 dark:invert">
					<button class="">About</button>
				</div>
			</div>
		</div>
	`;

	return template.content.firstElementChild as HTMLDivElement;
}