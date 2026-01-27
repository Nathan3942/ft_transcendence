function createPodium(genClasses: string, podClasses: string, id: string): HTMLDivElement {
	const div = document.createElement("div");
	const column = document.createElement("div");
	const img = document.createElement("img");

	div.className = genClasses + " " + "flex flex-col w-1/4 justify-center items-center" ;

	img.className = "w-1/2 w-max-1/2 h-max-1/2 aspect-[1/1]"
	img.src = "assets/images/user-svgrepo-com.svg"
	column.className = podClasses + " " + "flex h-full w-1/2 items-center justify-center"
	column.append(id) 

	div.append(img, column)
	return div;
}

export default function buildLeaderboardPage(): HTMLDivElement {
	const outer = document.createElement("div");
	const podium = document.createElement("div");
	const leaderboard = document.createElement("div");

	outer.className = "flex flex-1 flex-col items-center";
	podium.className = "flex w-1/3 columns-3 justify-center items-end h-1/2 m-6"
	podium.append(
		createPodium("h-5/6", "bg-gray-500", "2"),
		createPodium("h-full", "bg-yellow-900", "1"),
		createPodium("h-2/3", "bg-orange-900", "3")
	)

	outer.append(podium, leaderboard);

	return outer;
}