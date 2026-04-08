import createBackButton from "../components/button/backButton";
import { createButton } from "../components/button/button";
import { API_BASE } from "../handler/loginHandler";
import { getItem } from "../helpers/localStoragehelper";
import { t } from "../i18n/i18n";

// Variable names subject to change with proper backend integration
type userInfo = {
	userId: string;
	username: string;
	wins: number;
	losses: number;
	totalMatches: number;
	winrate: number;
	winrateString: string;
}

type scoreKey = keyof Pick<
	userInfo,
	| "username"
	| "wins"
	| "losses"
	| "totalMatches"
	| "winrate"
>;

async function importUserData(): Promise<userInfo[]> {
	 try {
		
		const response = await fetch(`${API_BASE}/leaderboard`, {
			method: "GET",
		});
		if (!response.ok) {
			if (response.status === 400)
				throw new Error(`${t("leaderboard.errorRequest")}: ${response.status}: ${response.text()}`);

			throw new Error(`${t("leaderboard.errorNetwork")}: ${response.status}: ${response.statusText}`);
		}
		const jsonData = await response.json();

		if (!Array.isArray(jsonData)) {
			throw new Error(t("leaderboard.errorUnexpectedPayload"));
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
	const classBase = "border border-gray-200 dark:border-gray-700 border border-b "

	for (let i = 0; i < users.length; ++i) {
		const cell = document.createElement("tr");
		const user = users.at(i);

		switch (i) {
			case 0:
				cell.className = classBase + "bg-yellow-300 hover:bg-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-yellow-900 hover:text-yellow-950 dark:text-yellow-400 dark:hover:text-yellow-300";
				break;
			case 1:
				cell.className = classBase + "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-600 hover:text-gray:700 dark:text-gray-400 dark:hover:text-gray-300"
				break;
			case 2:
				cell.className = classBase + "bg-amber-500 hover:bg-amber-600 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 hover:text-amber-950 dark:text-amber-600 dark:hover:text-amber-500"
				break
			default:
				cell.className = classBase + "bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800";
		
		}

		cell.append(
			createTdElement(i),
			createTdElement(user?.username || "Undefined"),
			createTdElement(user?.wins || NaN),
			createTdElement(user?.losses || NaN),
			createTdElement(user?.totalMatches || NaN),
			createTdElement(user?.winrateString || "NaN"),
		);

		tBody.append(cell);
	}

	return tBody;
};

export default async function buildLeaderboardPage(): Promise<HTMLDivElement> {

	// Helper functions
	function buildLeaderboard(key: scoreKey): HTMLTableSectionElement {
		switch(key) {
			case "wins": {
				users.sort((a, b) => b.wins - a.wins);

				break;
			}
			case "losses": {
				users.sort((a, b) => b.losses - a.losses);
				
				break;
			}
			case "totalMatches": {
				users.sort((a, b) => b.totalMatches - a.totalMatches);

				break;
			}
			case "winrate": {
				users.sort((a, b) => b.winrate - a.winrate);

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
	th.className = "text-left py-3 px-2"
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
	let users: userInfo[];
	
	// Setting metadata
	tbody.id = "tableBody";
	leaderboard.id = "tableDiv";
	
	// Setting styling
	outer.className = "flex flex-1 flex-col h-[calc(100vh-64px)] w-full overflow-hidden";
	leaderboard.className = "flex flex-col flex-1 items-center justify-start pt-5 w-full overflow-hidden";
	tableContainer.className = "w-full max-w-4xl mx-auto h-full overflow-auto";
	table.className = "w-full max-w-4xl h-5/6 mx-auto border border-gray-200";
	tHead.className = "w-full dark:bg-gray-800 bg-gray-100 border border-gray-200 dark:border-gray-700 sticky top-0";

	// creating Table Head
	const tr = document.createElement("tr");
	const userNames = document.createElement("th");
	userNames.className = "text-left py-3 px-4";
	userNames.append(t("leaderboard.userName"));
	const pos = document.createElement("th");
	pos.className = "text-left py-3 px-4 w-15";
	pos.append(t("leaderboard.rank"))


	tr.append(
		pos,
		userNames,
		createThElement(t("leaderboard.wins"), "winsButton", "wins"),
		createThElement(t("leaderboard.losses"), "lossButton", "losses"),
		createThElement(t("leaderboard.totalMatches"), "totalMatchButton", "totalMatches"),
		createThElement(t("leaderboard.winrate"), "winrateButton", "winrate"),
	)
	
	tHead.append(tr);
	table.append(tHead, tbody);
	tableContainer.append(table)
	leaderboard.append(tableContainer);
	outer.append(leaderboard);

	if (getItem("loggedIn") === true) {
		outer.append(createBackButton("bg-red-300 dark:bg-red-900", "/"));
	}
	
	try {
		users = await importUserData();
		for (let i = 0; i < users.length; ++i) {
			let user = users.at(i);
			if (user) {
				user.winrateString = user.winrate.toPrecision(2).slice(2) + "%";
			}
		}
		
		tbody.replaceWith(buildLeaderboard("wins"), );
	} catch (e) {
		console.error("Could not load users:", e);
		tHead.replaceWith(`${t("leaderboard.errorLoading")}: ${e}`);
	}

	return outer;
}