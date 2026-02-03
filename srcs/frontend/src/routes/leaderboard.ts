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

function createLeaderboardCell(user: userInfo): HTMLDivElement {
	const cell = document.createElement("div");

	return cell;
};

export async function buildLeaderboardPage(): Promise<HTMLDivElement> {

	// Helper functions
	function buildLeaderboard(key: scoreKey): HTMLDivElement {
		const board = document.createElement("div");

		switch(key) {
			case "localAiE": {

				break;
			}
			case "localAiM": {

				break;
			}
			case "localAiH": {
				
				break;
			}
			case "totalLocalScore": {

				break;
			}
			case "onlineCustom": {

				break;
			}
			case "onlineTournament": {

				break;
			}
			case "totalOnlineScore": {

				break;
			}
		}

		return board;
	}

	function buildBoardChooser(): HTMLDivElement {
		const buttons = document.createElement("div");
		const genClasses = "";
		buttons.append(createButton({
				buttonText: "Easy AI",
				extraClasses: genClasses,
				f: () => leaderboard.replaceWith(buildLeaderboard("localAiE")),
			}),
			createButton({
				buttonText: "Medium AI",
				extraClasses: genClasses,
				f: () => leaderboard.replaceWith(buildLeaderboard("localAiM")),
			}),
			createButton({
				buttonText: "Hard AI",
				extraClasses: genClasses,
				f: () => leaderboard.replaceWith(buildLeaderboard("localAiH")),
			}),
			createButton({
				buttonText: "Total AI",
				extraClasses: genClasses,
				f: () => leaderboard.replaceWith(buildLeaderboard("totalLocalScore")),
			}),
			createButton({
				buttonText: "Custom Matches",
				extraClasses: genClasses,
				f: () => leaderboard.replaceWith(buildLeaderboard("onlineCustom")),
			}),
			createButton({
				buttonText: "Online Tournaments",
				extraClasses: genClasses,
				f: () => leaderboard.replaceWith(buildLeaderboard("onlineTournament")),
			}),
			createButton({
				buttonText: "Total Online",
				extraClasses: genClasses,
				f: () => leaderboard.replaceWith(buildLeaderboard("totalOnlineScore"))
			})
		)

		return buttons;
	}

	// Function Proper
	const outer = document.createElement("div");
	const leaderboard = document.createElement("div");
	const boardChooser = document.createElement("div");
	const backButton = createBackButton("", "/");
	let users: userInfo[];
	
	outer.className = "flex flex-1 flex-col";
	
	try {
		users = await importUserData();
		leaderboard.replaceWith(buildLeaderboard("onlineCustom"));
	} catch (e) {
		console.log("Could not load users:", e);
		leaderboard.append(`Could not load users: ${e}`);
	}
	
	boardChooser.replaceWith(buildBoardChooser());

	outer.append(boardChooser, leaderboard, backButton);

	return outer;
}