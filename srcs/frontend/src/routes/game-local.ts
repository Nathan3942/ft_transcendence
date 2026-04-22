/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game-local.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/22 14:02:07 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/22 14:02:09 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import createBackButton from "../components/button/backButton";
import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import { t } from "../i18n/i18n";

import { startPong } from "../game/pong.js";
import { fitCanvasToDisplay, type ModeId, type PongEvents } from "../game/pong_core.js";
import { getRouter } from "../handler/routeHandler.js";
import { getLocalId } from "../helpers/apiHelper.js";

type LocalMatchSession = {
	stop: () => void;
	cleanup: () => void;
};

let activeSession: LocalMatchSession | null = null;

function cleanupLocalMatch(): void {
	if (!activeSession)
		return;
	activeSession.cleanup();
	activeSession = null;
}

async function saveMatchResult(
	p1Id: number | null,
	p2Id: number | null,
	s1: number,
	s2: number,
	winner: 1 | 2,
	mode: ModeId,
	p1Name: string,
	p2Name: string
): Promise<void> {
	const winnerId = winner === 1 ? p1Id : p2Id;

	try {
		await fetch("/api/v1/matches/result", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				player1Id: p1Id,
				player2Id: p2Id,
				scorePlayer1: s1,
				scorePlayer2: s2,
				winnerId,
				mode,
			}),
		});
		console.log(`Match sauvegardé : ${p1Name} ${s1} - ${s2} ${p2Name}`);
	} catch (err) {
		console.error("Erreur sauvegarde match:", err);
	}
}

async function createLocalMatch(
	outer: HTMLDivElement,
	p1Name: string,
	p2Name: string
): Promise<void> {
	cleanupLocalMatch();

	const p1Id = getLocalId();
	const p2Id = null;

	outer.innerHTML = "";
	outer.style.width = "100vw";
	outer.style.height = "80vh";
	outer.style.display = "block";

	const canvas = document.createElement("canvas");
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	outer.appendChild(canvas);

	const ctx = canvas.getContext("2d");
	if (!ctx)
		throw new Error("2D context not supported");

	const rect = outer.getBoundingClientRect();
	canvas.width = rect.width || window.innerWidth;
	canvas.height = rect.height || window.innerHeight;

	await (document as any).fonts?.ready;

	let matchSaved = false;
	let inGameOver = false;

	const events: PongEvents = {
		onStateChange: (phase) => {
			if (phase === "GAMEOVER") {
				inGameOver = true;
				return;
			}
			if (inGameOver && phase === "COUNTDOWN") {
				matchSaved = false;
				inGameOver = false;
			}
		},

		onGameOver: async (winner: 1 | 2 | 3 | 4, s1: number, s2: number, mode: ModeId) => {
			if (winner !== 1 && winner !== 2)
				return;
			if (matchSaved)
				return;

			matchSaved = true;
			console.log(`p1: ${p1Id}, p2: ${p2Id}`);

			await saveMatchResult(p1Id, p2Id, s1, s2, winner, mode, p1Name, p2Name);
		},
	};

	fitCanvasToDisplay(canvas);

	const controller = startPong(
		canvas,
		ctx,
		{ mode: "1v1", tournament: false },
		{},
		events
	);

	const onResize = () => {
		const r = outer.getBoundingClientRect();
		controller.resize(r.width || window.innerWidth, r.height || window.innerHeight);
	};

	window.addEventListener("resize", onResize);

	activeSession = {
		stop: () => {
			controller.stop();
		},
		cleanup: () => {
			window.removeEventListener("resize", onResize);
			controller.stop();
		},
	};

	console.log("Start pong in local mode");
}

export default function createGameLocalPage(): HTMLDivElement {
	cleanupLocalMatch();

	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end";
	inner.className =
		"text-3xl w-full md:w-9/12 flex flex-col items-center md:items-end gap-4 py-4 md:h-2/3 md:justify-evenly md:gap-0 md:py-0";

	outer.append(createBackButton("bg-blue-300 dark:bg-blue-900", "/"));

	const btnClasses = "flex flex-row p-4 w-full";

	inner.append(
		makeButtonBlock(
			"bg-blue-300 dark:bg-blue-900",
			createButton({
				id: "vs-ai-button",
				extraClasses: btnClasses,
				buttonText: t("gameLocal.playerVsAi"),
				href: "/game-local-ai",
				icon: "assets/images/robot-svgrepo-com.svg",
				iconAlt: "Icon",
				iconBClass: "h-10 pr-3 dark:invert",
			})
		),

		makeButtonBlock(
			"bg-purple-300 dark:bg-purple-900",
			createButton({
				id: "vs-player-button",
				extraClasses: btnClasses,
				buttonText: t("gameLocal.playerVsPlayer"),
				f: () => {
					void createLocalMatch(outer, "Player 1", "Player 2");
				},
				icon: "assets/images/keyboard-svgrepo-com.svg",
				iconAlt: "Icon",
				iconBClass: "h-10 pr-3 dark:invert",
			})
		),

		makeButtonBlock(
			"bg-cyan-300 dark:bg-cyan-900",
			createButton({
				id: "create-local-tournament",
				extraClasses: btnClasses,
				buttonText: t("gameLocal.localTournament"),
				f: () => {
					cleanupLocalMatch();
					getRouter().lazyLoad("/tournament-local");
				},
				icon: "assets/images/trophy-svgrepo-com.svg",
				iconAlt: "Icon",
				iconBClass: "h-10 pr-3 dark:invert",
			})
		)
	);

	outer.appendChild(inner);
	return outer;
}