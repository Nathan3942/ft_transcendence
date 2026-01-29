function createPodium(genClasses: string, podClasses: string, id: string): HTMLDivElement {
	const div = document.createElement("div");
	const column = document.createElement("div");
	const img = document.createElement("img");

	div.className = genClasses + " " + "flex flex-col w-1/3 justify-center items-center" ;

	img.className = "w-1/2 w-max-1/2 h-max-1/2 aspect-[1/1] dark:invert"
	img.src = "assets/images/user-svgrepo-com.svg"
	column.className = podClasses + " " + "flex h-full w-1/2 items-center justify-center"
	column.append(id) 

	div.append(img, column)
	return div;
}

export default function buildLeaderboardPage(): HTMLDivElement {
	const outer = document.createElement("div");
	const leaderboard = document.createElement("div");

	outer.className = "flex flex-1 flex-col items-center";
	leaderboard.className = "w-3/4"

	outer.append(leaderboard);

	return outer;
}