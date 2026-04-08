import { createButton } from "../components/button/button";
import { API_BASE } from "../handler/loginHandler";
import { fetchUser, getLocalId } from "../helpers/apiHelper";
import { BASE_PFP, getLocalUserAvatar } from "../helpers/avatarHelper";
import { getItem } from "../helpers/localStoragehelper";
import { t } from "../i18n/i18n";
import type { RouteParams, user, userMatchHistoryResponse, userStatsResponse } from "../interfaces/properties";

async function fetchUserStats(userId: number): Promise<userStatsResponse> {
	const resp = await fetch(`${API_BASE}/users/${userId}/stats`, {
		method: "GET",
		credentials: "include"
	})

	if (resp.ok) {
		const respJson = await resp.json() as userStatsResponse;
		return respJson;
	} else if (resp.status === 400)
		throw new Error(`400: ${t("profile.errorInvalidId")}`);
	else if (resp.status === 404)
		throw new Error(`404: ${t("profile.userNotFound")}`);
	else
		throw new Error(`${t("profile.errorUnexpected")}: ${resp.status}`);
}

async function fetchMatchHistory(userId: number): Promise<userMatchHistoryResponse> {
	const resp = await fetch(`${API_BASE}/users/${userId}/matches`, {
		method: "GET",
		credentials: "include"
	})

	if (resp.ok) {
		const respJson = await resp.json() as userMatchHistoryResponse;
		return respJson;
	} else if (resp.status === 400)
		throw new Error(`400: ${t("profile.errorInvalidId")}`);
	else if (resp.status === 401)
		throw new Error(`401: ${t("profile.errorNotAuthenticated")}`);
	else if (resp.status === 404)
		throw new Error(`404: ${t("profile.userNotFound")}`);
	else
		throw new Error(`${t("profile.errorUnexpected")}: ${resp.status}`);
}

export default async function initUserProfile(params?: RouteParams): Promise<void> {

	// Initialisation of document elements
	const pfp = document.getElementById("profilePfp") as HTMLImageElement;
	const username = document.getElementById("profileUsername") as HTMLHeadingElement;
	const userIdDisplay = document.getElementById("userIdDisplay") as HTMLParagraphElement;
	const onlineStatus = document.getElementById("onlineStatus") as HTMLParagraphElement;

	const userStatsDiv = document.getElementById("userStats") as HTMLDivElement;
	const matchHistoryTable = document.getElementById("matchHistory") as HTMLTableElement;

	// Initialisation of user stats
	const id = params?.id ? parseInt(params.id, 10) : null;
	if (!id) {
		console.error("Error: No user id found, cannot load statistics");
		userStatsDiv.innerHTML = `
			<div class="col-span-4 pl-6">
				${t("profile.errorNoIdStats")}
			</div>
		`;
		matchHistoryTable.innerHTML =  `
			<div class="pl-6">
				${t("profile.errorNoIdHistory")}
			</div>
		`
		return ;
	}

	let userInfo: user;

	if (id === getLocalId()) {
		userInfo = {
			id: id,
			username: getItem<string>("username") ?? "null",
			display_name: getItem<string>("display_name") ?? "null",
			avatar_url: getLocalUserAvatar(),
			is_online: getItem<boolean>("is_online") ?? false
		};
	} else {
		try {
			userInfo = await fetchUser(id);
		} catch (e) {
			console.error(`Error: Cannot get user information for id ${id}: ${e}`);
			pfp.src = BASE_PFP;
			username.innerText = t("profile.userNotFound");
			userIdDisplay.append(`${id}`);
			userStatsDiv.innerHTML = `<div class="col-span-4 pl-6">${t("profile.userNotFound")}.</div>`;
			matchHistoryTable.innerHTML = `<div class="pl-6">${t("profile.userNotFound")}.</div>`;
			return ;
		}
	}

	username.innerText = userInfo.username;
	if (userInfo.avatar_url)
		pfp.src = userInfo.avatar_url;
	if (userIdDisplay)
		userIdDisplay.append(`${userInfo.id}`);
	if (userInfo.is_online) {
		onlineStatus.classList.add("text-green-700", "text-green-500");
		onlineStatus.innerText = t("profile.online");
	} else {
		onlineStatus.classList.add("text-gray-500", "dark:text-gray-400");
		onlineStatus.innerText = t("profile.offline");
	}


	try {
		const dataStats = await fetchUserStats(id);
		const userStats = dataStats.data;

		document.getElementById("totalMatches")!.textContent = userStats.totalMatches.toString();
		document.getElementById("tournamentsWon")!.textContent = userStats.tournamentsWon.toString();
		document.getElementById("wins")!.textContent = userStats.wins.toString();
		document.getElementById("losses")!.textContent = userStats.losses.toString();
		document.getElementById("winrate")!.textContent = `${userStats.winrate * 100}%`;

		const winCircle = document.getElementById("winCircle");
		if (winCircle instanceof SVGCircleElement) {
			const lossCircle = document.getElementById("lossCircle")!;

			const circumference = 251.2;
			const winPercentage = userStats.winrate;
			const lossPercentage = 1 - winPercentage;
			const winDegrees = winPercentage * 360;

			winCircle.style.strokeDashoffset = (circumference - (winPercentage * circumference)).toString();
			lossCircle.style.transform = `rotate(${winDegrees}deg)`;
			lossCircle.style.transformOrigin = "center";
			lossCircle.style.strokeDashoffset = (circumference - (lossPercentage * circumference)).toString();
		}

	} catch (e) {
		console.error(`Error: Unable to fetch user stats: ${e}`);
		userStatsDiv.innerHTML = `
			<div class="col-span-4 pl-6">
				${t("profile.errorFetchStats")}${e}
			</div>
		`;
	}

	try {

		const matchHistoryArray = (await fetchMatchHistory(id)).data;
		const tbody = matchHistoryTable.querySelector("tbody")!;

		tbody.innerHTML = "";

		for (let i = matchHistoryArray.length - 1; i >= 0; --i) {
			const match = matchHistoryArray[i];
			const newRow = tbody.insertRow();
			newRow.classList.add("text-center");
			
			const cell1 = newRow.insertCell(0); // Match ID
			const cell2 = newRow.insertCell(1); // Opponent Info
			const cell3 = newRow.insertCell(2); // Score
			const cell4 = newRow.insertCell(3); // Result
			const cell5 = newRow.insertCell(4); // Date

			cell1.textContent = match.matchId.toString();
			cell2.append(createButton({
				buttonText: match.opponentName,
				href: `/user-profile/${match.opponentId}`,
				id: `profile-button-${match.opponentId}`,
				extraClasses: "hover:opacity-80"
			}));
			cell3.textContent = `${match.userScore} - ${match.opponentScore}`;
			if (match.won)
				cell4.classList.add("text-green-600", "dark:text-green-400");
			else
				cell4.classList.add("text-red-600", "text-red-400");
			cell4.textContent = match.won ? t("profile.win") : t("profile.loss");
			const date: string[] = match.finishedAt.split("T");
			cell5.textContent = `${date.at(0)} - ${date.at(1)?.replace("Z", "")}`;

		}
	} catch (e) {
		console.error(`Error: Unable to fetch match history: ${e}`);
		matchHistoryTable.classList.remove("border");
		matchHistoryTable.innerHTML = `
			<div class="col-span-4 pl-6">
				${t("profile.errorFetchHistory")}${e}
			</div>
		`;
	}
}