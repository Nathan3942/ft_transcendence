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
		const response = await fetch("apiOrWhatever");
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

function createLeaderboardCells(users: userInfo[]): HTMLDivElement {

	const tBody = document.createElement("tbody");

	for (let i = 0; i < users.length; ++i) {
		const cell = document.createElement("tr");
		const user = users.at(i);

		const userName = document.createElement("th");



		cell.append(userName)
		tBody.append(cell);
	}

	return tBody;
};

function createThElement(head: string): HTMLDivElement {
	const th = document.createElement("th")
	th.append(head);
	return th;
}

export async function buildLeaderboardPage(): Promise<HTMLDivElement> {

	// Helper functions
	function buildLeaderboard(key: scoreKey): HTMLDivElement {
		const board = document.createElement("div");

		switch(key) {
			case "localAiE": {
				users.sort((a, b) => a.localAiE - b.localAiE);

				break;
			}
			case "localAiM": {
				users.sort((a, b) => a.localAiM - b.localAiM);

				break;
			}
			case "localAiH": {
				users.sort((a, b) => a.localAiH - b.localAiH);
				
				break;
			}
			case "totalLocalScore": {
				users.sort((a, b) => {
					const aScore = a.totalLocalScore ?? Number.NEGATIVE_INFINITY;
					const bScore = b.totalLocalScore ?? Number.NEGATIVE_INFINITY;
					return aScore - bScore;
				});

				break;
			}
			case "onlineCustom": {
				users.sort((a, b) => a.onlineCustom - b.onlineCustom);

				break;
			}
			case "onlineTournament": {
				users.sort((a, b) => a.onlineTournament - b.onlineTournament);

				break;
			}
			case "totalOnlineScore": {
				users.sort((a, b) => {
					const aScore = a.totalOnlineScore ?? Number.NEGATIVE_INFINITY;
					const bScore = b.totalOnlineScore ?? Number.NEGATIVE_INFINITY;
					return aScore - bScore;
				});

				break;
			}
		}

		return board;
	}

	function buildBoardChooser(): HTMLDivElement {
		const buttons = document.createElement("div");
		const toReplace = document.getElementById("tableBody");
		if (!toReplace) {
			console.log("Page initialised incorrectly");
		}
		const genClasses = "";
		buttons.append(createButton({
				buttonText: "Easy AI",
				extraClasses: genClasses,
				f: () => toReplace?.replaceWith(buildLeaderboard("localAiE")),
			}),
			createButton({
				buttonText: "Medium AI",
				extraClasses: genClasses,
				f: () => toReplace?.replaceWith(buildLeaderboard("localAiM")),
			}),
			createButton({
				buttonText: "Hard AI",
				extraClasses: genClasses,
				f: () => toReplace?.replaceWith(buildLeaderboard("localAiH")),
			}),
			createButton({
				buttonText: "Total AI",
				extraClasses: genClasses,
				f: () => toReplace?.replaceWith(buildLeaderboard("totalLocalScore")),
			}),
			createButton({
				buttonText: "Custom Matches",
				extraClasses: genClasses,
				f: () => toReplace?.replaceWith(buildLeaderboard("onlineCustom")),
			}),
			createButton({
				buttonText: "Online Tournaments",
				extraClasses: genClasses,
				f: () => toReplace?.replaceWith(buildLeaderboard("onlineTournament")),
			}),
			createButton({
				buttonText: "Total Online",
				extraClasses: genClasses,
				f: () => toReplace?.replaceWith(buildLeaderboard("totalOnlineScore"))
			})
		)

		return buttons;
	}

	// Function Proper
	const outer = document.createElement("div");
	const boardChooser = document.createElement("div");
	const leaderboard = document.createElement("div");
	const table = document.createElement("table");
	const tHead = document.createElement("thead");
	const tbody = document.createElement("tbody");
	const backButton = createBackButton("", "/");
	let users: userInfo[];
	
	// Setting metadata
	outer.className = "flex flex-1 flex-col";
	tbody.id = "tableBody";

	// creating Table Head
	const tr = document.createElement("tr");
	tr.append(
		createThElement("User Name"),
		createThElement("Ai Easy"),
		createThElement("Ai Medium"),
		createThElement("Ai Hard"),
		createThElement("Total Local"),
		
	)
	
	tHead.append(tr, tbody);
	table.append(tHead);
	
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
		console.log("Could not load users:", e);
		leaderboard.append(`Could not load users: ${e}`);
	}
	
	try {
		boardChooser.replaceWith(buildBoardChooser());
	} catch (e) {

	}

	leaderboard.append(table);
	
	outer.append(boardChooser, leaderboard, backButton);

	return outer;
}