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
		const jsonData = await response.json() as { data: userInfo[] };

		if (!Array.isArray(jsonData.data)) {
			throw new Error(t("leaderboard.errorUnexpectedPayload"));
		}

		const users = jsonData.data;
		
		return users;
	} catch (err) {
		console.error(`Failed to import user data:`, err)
		throw err;
	}
};

function createTdElement(body: string | number): HTMLElement {
	const td = document.createElement("td");
	td.className = "py-2 px-4 border-b border-gray-200 dark:border-gray-700";
	if (typeof body === "string")
		td.append(body);
	if (typeof body === "number")
		td.append(body.toString());
	return td;
}

// Creates the sorted cells and returns 
function createLeaderboardCells(users: userInfo[]): HTMLTableSectionElement {

	const tBody = document.createElement("tbody");
	tBody.className = "w-full";
	tBody.id = "tableBody";

	for (let i = 0; i < users.length; ++i) {
		const cell = document.createElement("tr");
		const user = users.at(i);

		switch (i) {
			case 0:
				cell.className = "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950 dark:hover:bg-yellow-900 text-yellow-800 dark:text-yellow-300";
				break;
			case 1:
				cell.className = "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300";
				break;
			case 2:
				cell.className = "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-400";
				break;
			default:
				cell.className = "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-white";
		}

		const usernameTd = document.createElement("td");
		usernameTd.className = "py-2 px-4 border-b border-gray-200 dark:border-gray-700";
		usernameTd.append(createButton({
			buttonText: user?.username || "Undefined",
			href: `/user-profile/${user?.userId}`,
			extraClasses: "hover:opacity-80 transition-colors duration-150",
		}));

		cell.append(
			createTdElement(i + 1),
			usernameTd,
			createTdElement(user?.wins || 0),
			createTdElement(user?.losses || 0),
			createTdElement(user?.totalMatches || 0),
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

	function createThElement(text: string, id: string, key: scoreKey): HTMLElement {
		const th = document.createElement("th");
		th.className = "text-left py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800";
		th.append(createButton({
			buttonText: text,
			id: id,
			extraClasses: "font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150",
			f: () => replaceTableBody(key),
		}));
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
	outer.className = "flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-4 overflow-hidden";
	leaderboard.className = "flex flex-col flex-1 w-full max-w-4xl mx-auto overflow-hidden";
	tableContainer.className = "flex-1 overflow-auto border border-gray-200 dark:border-gray-700";
	table.className = "w-full";
	tHead.className = "sticky top-0";

	// Page title
	const pageTitle = document.createElement("h2");
	pageTitle.className = "text-xl font-bold mb-4 text-gray-800 dark:text-white";
	pageTitle.textContent = `▐ ${t("home.leaderboard")}`;
	leaderboard.append(pageTitle);

	// creating Table Head
	const tr = document.createElement("tr");
	const userNames = document.createElement("th");
	userNames.className = "text-left py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white";
	userNames.append(t("leaderboard.userName"));
	const pos = document.createElement("th");
	pos.className = "text-left py-2 px-4 w-14 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white";
	pos.append(t("leaderboard.rank"));


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
	tableContainer.append(table);
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
				user.winrateString = user.winrate + "%";
			}
		}
		
		tbody.replaceWith(buildLeaderboard("wins"), );
	} catch (e) {
		console.error("Could not load users:", e);
		tHead.replaceWith(`${t("leaderboard.errorLoading")}: ${e}`);
	}

	return outer;
}