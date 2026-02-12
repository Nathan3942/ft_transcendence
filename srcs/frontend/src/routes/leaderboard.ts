import createBackButton from "../components/button/backButton";
import { createButton } from "../components/button/button";

// Variable names subject to change with proper backend integration
type userInfo = {
	userName: string;
	localAiE: number;
	localAiM: number;
	localAiH: number;
	onlineCustom: number;
	onlineTournament: number;

	totalLocalScore?: number;
	totalOnlineScore?: number;
}

type scoreKey = keyof Pick<
	userInfo,
	| "localAiE"
	| "localAiM"
	| "localAiH"
	| "onlineCustom"
	| "onlineTournament"
	| "totalLocalScore"
	| "totalOnlineScore"
>;

async function importUserData(): Promise<userInfo[]> {
	 try {
		
		const response = await fetch("/api/test/users.json");
		if (!response.ok) {
			throw new Error(`Network error: ${response.status} ${response.statusText}`);
		}
		const jsonData = await response.json();

		if (!Array.isArray(jsonData)) {
			throw new Error(`Unexpected payload, expected an array`)
		}
		
		const users = jsonData as userInfo[];
		
		return users;
	} catch (err) {
		console.error(`Failed to import user data:`, err)
		throw err;
	}
};

function createTdElement(body: string | number, ): HTMLDivElement {
	const td = document.createElement("td");
	td.className = "py-1.5 px-4"
	if (typeof body === "string")
		td.append(body);
	if (typeof body === "number")
		td.append(body.toString());
	return td;
}

// Creates the sorted cells and returns 
function createLeaderboardCells(users: userInfo[]): HTMLTableSectionElement {

	const tBody = document.createElement("tbody");
	tBody.className = "w-full"
	tBody.id = "tableBody";
	const classBase = "border-gray-200 dark:border-gray-700 border border-b hover:brightness-90 dark:hover:brightness-120 "

	for (let i = 0; i < users.length; ++i) {
		const cell = document.createElement("tr");
		const user = users.at(i);

		switch (i) {
			case 0:
				cell.className = classBase + "bg-yellow-300 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-400";
				break;
			case 1:
				cell.className = classBase + "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
				break;
			case 2:
				cell.className = classBase + "bg-amber-500 dark:bg-amber-900 text-amber-900 dark:text-amber-600"
				break
			default:
				cell.className = classBase + "bg-gray-100 dark:bg-gray-900";
		
		}

		cell.append(
			createTdElement(i),
			createTdElement(user?.userName || "Undefined"),
			createTdElement(user?.localAiE || NaN),
			createTdElement(user?.localAiM || NaN),
			createTdElement(user?.localAiH || NaN),
			createTdElement(user?.totalLocalScore || NaN),
			createTdElement(user?.onlineCustom || NaN),
			createTdElement(user?.onlineTournament || NaN),
			createTdElement(user?.totalOnlineScore || NaN)
		);

		tBody.append(cell);
	}

	return tBody;
};

export async function buildLeaderboardPage(): Promise<HTMLDivElement> {

	// Helper functions
	function buildLeaderboard(key: scoreKey): HTMLTableSectionElement {
		switch(key) {
			case "localAiE": {
				users.sort((a, b) => b.localAiE - a.localAiE);

				break;
			}
			case "localAiM": {
				users.sort((a, b) => b.localAiM - a.localAiM);

				break;
			}
			case "localAiH": {
				users.sort((a, b) => b.localAiH - a.localAiH);
				
				break;
			}
			case "totalLocalScore": {
				users.sort((a, b) => {
					const aScore = a.totalLocalScore ?? Number.NEGATIVE_INFINITY;
					const bScore = b.totalLocalScore ?? Number.NEGATIVE_INFINITY;
					return bScore - aScore;
				});

				break;
			}
			case "onlineCustom": {
				users.sort((a, b) => b.onlineCustom - a.onlineCustom);

				break;
			}
			case "onlineTournament": {
				users.sort((a, b) => b.onlineTournament - a.onlineTournament);

				break;
			}
			case "totalOnlineScore": {
				users.sort((a, b) => {
					const aScore = a.totalOnlineScore ?? Number.NEGATIVE_INFINITY;
					const bScore = b.totalOnlineScore ?? Number.NEGATIVE_INFINITY;
					return bScore - aScore;
				});

				break;
			}
		}

		return createLeaderboardCells(users);
	}

	function replaceTableBody(score: scoreKey) {
		const currentTbody = document.getElementById("tableBody")
		currentTbody?.replaceWith(buildLeaderboard(score));
	}

	function createThElement(text: string, id: string, key: scoreKey): HTMLDivElement {
	const th = document.createElement("th");
	th.className = "text-left py-3 px-1"
	th.append(createButton({
				buttonText: text,
				id: id,
				extraClasses: "",
				f: () => replaceTableBody(key),
			}))
	return th;
}

	// Function Proper
	const outer = document.createElement("div");
	const leaderboard = document.createElement("div");
	const tableContainer = document.createElement("div");
	const table = document.createElement("table");
	const tHead = document.createElement("thead");
	const tbody = document.createElement("tbody");
	const backButton = createBackButton("", "/");
	let users: userInfo[];
	
	// Setting metadata
	tbody.id = "tableBody";
	leaderboard.id = "tableDiv";
	
	// Setting styling
	outer.className = "flex flex-1 flex-col h-[calc(100vh-64px)] w-full overflow-hidden";
	leaderboard.className = "flex flex-col flex-1 items-center justify-start p-4 w-full overflow-hidden";
	tableContainer.className = "w-full max-w-4xl mx-auto h-full overflow-auto";
	table.className = "w-full max-w-4xl h-5/6 mx-auto border border-gray-200";
	tHead.className = "w-full dark:bg-gray-800 bg-gray-100 border border-gray-200 dark:border-gray-700 p-4 sticky top-0";

	// creating Table Head
	const tr = document.createElement("tr");
	const userNames = document.createElement("th");
	userNames.className = "text-left py-3 px-4";
	userNames.append("User Name");
	const pos = document.createElement("th");
	pos.className = "text-left py-3 px-4 w-15";
	pos.append("#")


	tr.append(
		pos,
		userNames,
		createThElement("Ai Easy", "aiEasyButton", "localAiE"),
		createThElement("Ai Medium", "aiMediumButton", "localAiM"),
		createThElement("Ai Hard", "aiHardButton", "localAiH"),
		createThElement("Total Ai", "toalAiButton", "totalLocalScore"),
		createThElement("Custom Matches", "customOnlineButton", "onlineCustom"),
		createThElement("Online Tournament", "onlineTournamentButton", "onlineTournament"),
		createThElement("Total Online", "toalOnlineButton", "totalOnlineScore")
	)
	
	tHead.append(tr);
	table.append(tHead, tbody);
	tableContainer.append(table)
	leaderboard.append(tableContainer);
	outer.append(leaderboard, backButton);
	
	try {
		users = await importUserData();
		for (let i = 0; i < users.length; ++i) {
			let user = users.at(i);
			if (user) {
				user.totalLocalScore = user.localAiE + user.localAiH + user.localAiM;
				user.totalOnlineScore = user.onlineCustom + user.onlineTournament;
			}
		}
		
		tbody.replaceWith(buildLeaderboard("onlineCustom"), );
	} catch (e) {
		console.error("Could not load users:", e);
		tbody.replaceWith(`Could not load users: ${e}`);
	}

	return outer;
}