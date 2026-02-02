import createBackButton from "../components/button/backButton";
import { createButton } from "../components/button/button";

export default function buildLeaderboardPage(): HTMLDivElement {
	
	function buildOnlineLeaderboard(): HTMLDivElement {
		const leaderboard = document.createElement("div");

		return leaderboard;
	}

	function buildOfflineLeaderboard(): HTMLDivElement {
		const leaderboard = document.createElement("div");

		return leaderboard;
	}

	function buildBoardChooser(): HTMLDivElement {
		const buttons = document.createElement("div");
		buttons.append(createButton({
				f: () => buildOnlineLeaderboard(),
			}),
			createButton({
				f: () => buildOfflineLeaderboard(),
			})
		)

		return buttons;
	}
	
	const outer = document.createElement("div");
	const boardChooser: HTMLDivElement = buildBoardChooser();
	const leaderboard: HTMLDivElement = buildOnlineLeaderboard();
	
	outer.className = "flex flex-1 flex-col";
	
	const backButton = createBackButton("", "/")

	outer.append(boardChooser, leaderboard, backButton);

	return outer;
}