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

function createLeaderboardCell(): HTMLDivElement {
	const cell = document.createElement("div");

	return cell;
};

export async function buildLeaderboardPage(): Promise<HTMLDivElement> {
	
	// Helper functions
	function buildLeaderboard(key: scoreKey): HTMLDivElement {
		const leaderboard = document.createElement("div");

		return leaderboard;
	}

	function buildBoardChooser(): HTMLDivElement {
		const buttons = document.createElement("div");
		buttons.append(createButton({
				buttonText: "Easy AI",
				f: () => buildLeaderboard("localAiE"),
			}),
			createButton({
				buttonText: "Medium AI",
				f: () => buildLeaderboard("localAiM"),
			}),
			createButton({
				buttonText: "Hard AI",
				f: () => buildLeaderboard("localAiH"),
			}),
			createButton({
				buttonText: "Total AI",
				f: () => buildLeaderboard("totalLocalScore"),
			}),
			createButton({
				buttonText: "Custom Matches",
				f: () => buildLeaderboard("onlineCustom"),
			}),
			createButton({
				buttonText: "Online Tournaments",
				f: () => buildLeaderboard("onlineTournament"),
			}),
			createButton({
				buttonText: "Total Online",
				f: () => buildLeaderboard("totalOnlineScore")
			})
		)

		return buttons;
	}

	// Function Proper
	const outer = document.createElement("div");
	const boardChooser: HTMLDivElement = buildBoardChooser();
	const leaderboard = document.createElement("div");
	const backButton = createBackButton("", "/");
	
	outer.className = "flex flex-1 flex-col";
	
	try {
		let users: userInfo[] = await importUserData();
		leaderboard.replaceWith(buildLeaderboard("onlineCustom"));
		
	} catch (e) {
		console.log("Could not load users:", e);
		leaderboard.append(`Could not load users: ${e}`);
	}
	

	outer.append(boardChooser, leaderboard, backButton);

	return outer;
}