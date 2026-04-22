/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tournament-local.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/02 16:32:13 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/22 15:08:24 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import { t } from "../i18n/i18n";
import { startPong } from "../game/pong";
import { fitCanvasToDisplay, type PongState } from "../game/pong_core";
import { makeAIPolicyP2 } from "../game/ai/policy";
import {
	genomeForDifficulty,
	createKeyMap,
	keyboardToInput,
	bindKeyboard,
	mergeKeyboardWithAIP2,
} from "./game-local-ai";
import hardGenome from "../game/ai/genomes/hard.json";
import { getRouter } from "../handler/routeHandler";

type Player = {
	id: number;
	name: string;
	ai: boolean;
};

type Match = {
	id: number;
	p1: Player;
	p2: Player;
	score?: { s1: number; s2: number };
};

type Bracket = {
	quarterfinal: Match[];
	semifinal: Match[];
	final: Match;
};

type GameResult = {
	winnerSide: 1 | 2;
	s1: number;
	s2: number;
};

type Stage = "QF" | "SF" | "F" | "DONE";
type AiLvl = "easy" | "medium" | "hard";

type TournamentState = {
	bracket: Bracket;
	stage: Stage;
	qfIndex: number;
	sfIndex: number;
	champion: Player | null;
	aiLvl: AiLvl | null;
};

let gTournament: TournamentState | null = null;

function createTextInput(id: string, placeholder: string): HTMLInputElement {
	const input = document.createElement("input");
	input.type = "text";
	input.id = id;
	input.placeholder = placeholder;

	input.className = `
		w-full min-w-0
		p-3 sm:p-3.5
		rounded-xl
		bg-white dark:bg-slate-800
		text-black dark:text-white
		placeholder:text-gray-500 dark:placeholder:text-gray-400
		border border-gray-300 dark:border-gray-600
		focus:outline-none focus:ring-2 focus:ring-blue-500
		text-sm sm:text-base
	`;

	return input;
}

function chooseAiLvl(inner: HTMLDivElement, onPick: (lvl: AiLvl) => void) {
	inner.innerHTML = "";
	inner.className = "w-full h-full min-h-0 flex flex-col items-center justify-center px-3 sm:px-4";

	const box = document.createElement("div");
	box.className = `
		w-full max-w-md
		flex flex-col gap-4 sm:gap-6
		p-4 sm:p-6
		rounded-2xl
		bg-slate-900/50
		backdrop-blur-sm
	`;

	const title = document.createElement("h2");
	title.textContent = t("tournamentLocal.chooseAiDifficulty");
	title.className = "text-white text-xl sm:text-2xl font-semibold text-center";
	box.appendChild(title);

	const btnClasses = "w-full flex flex-row p-4 justify-center items-center rounded-xl text-sm sm:text-base";

	const makePickBtn = (id: string, text: string, color: string, lvl: AiLvl) =>
		makeButtonBlock(
			color,
			createButton({
				id,
				extraClasses: btnClasses,
				buttonText: text,
				f: () => onPick(lvl),
			})
		);

	box.appendChild(makePickBtn("diff-easy-btn", t("gameLocalAi.easy"), "bg-blue-300 dark:bg-blue-900", "easy"));
	box.appendChild(makePickBtn("diff-medium-btn", t("gameLocalAi.medium"), "bg-purple-300 dark:bg-purple-900", "medium"));
	box.appendChild(makePickBtn("diff-hard-btn", t("gameLocalAi.hard"), "bg-red-300 dark:bg-red-900", "hard"));

	inner.appendChild(box);
}

function initTournamentFromInput(players: Player[], aiLvl: AiLvl | null): TournamentState {
	const seeded = shuffle(players);

	for (let i = 0; i < seeded.length; i += 2) {
		const p1 = seeded[i];
		const p2 = seeded[i + 1];

		if (p1.ai && !p2.ai) {
			seeded[i] = p2;
			seeded[i + 1] = p1;
		}
	}

	const bracket = buildBracketFromPlayers(seeded);

	return {
		bracket,
		stage: "QF",
		qfIndex: 0,
		sfIndex: 0,
		champion: null,
		aiLvl,
	};
}

function renderChampion(champ: Player): HTMLDivElement {
	const d = document.createElement("div");
	d.className = "mt-4 sm:mt-6 text-white text-lg sm:text-2xl font-semibold text-center px-2";
	d.textContent = `${t("tournamentLocal.champion")}: ${champ.name}`;
	return d;
}

function renderMatch(match: Match, title: string): HTMLDivElement {
	const card = document.createElement("div");
	card.className = `
		w-full min-w-0
		p-3 sm:p-4
		rounded-2xl
		bg-slate-900/40
		border border-white/10
		text-white
		backdrop-blur-sm
	`;

	const h = document.createElement("div");
	h.className = "text-xs sm:text-sm opacity-70 mb-3";
	h.textContent = title;

	const makeRow = (name: string, score?: number) => {
		const row = document.createElement("div");
		row.className = `
			w-full min-w-0
			p-3
			rounded-xl
			bg-white/5
			flex items-center justify-between gap-3
			text-sm sm:text-base
		`;

		const nameEl = document.createElement("span");
		nameEl.className = "min-w-0 break-words";
		nameEl.textContent = name;

		row.appendChild(nameEl);

		if (typeof score === "number") {
			const scoreEl = document.createElement("span");
			scoreEl.className = "shrink-0 font-semibold text-white/90";
			scoreEl.textContent = String(score);
			row.appendChild(scoreEl);
		}

		return row;
	};

	card.appendChild(h);
	card.appendChild(makeRow(match.p1.name, match.score?.s1));

	const spacer = document.createElement("div");
	spacer.className = "h-2";
	card.appendChild(spacer);

	card.appendChild(makeRow(match.p2.name, match.score?.s2));

	return card;
}

function renderBracket(bracket: Bracket): HTMLDivElement {
	const root = document.createElement("div");
	root.className = "w-full max-w-7xl mx-auto";

	const layout = document.createElement("div");
	layout.className = `
		grid grid-cols-1
		xl:grid-cols-3
		gap-4 sm:gap-6 xl:gap-8
		items-start
	`;

	const makeSection = (title: string, matches: Match[], labelPrefix: string, extraClasses = "") => {
		const section = document.createElement("section");
		section.className = `w-full min-w-0 flex flex-col gap-3 ${extraClasses}`.trim();

		const h = document.createElement("h3");
		h.textContent = title;
		h.className = "text-white/80 text-base sm:text-lg font-semibold px-1";
		section.appendChild(h);

		matches.forEach((m, i) => {
			section.appendChild(renderMatch(m, `${labelPrefix} ${i + 1}`));
		});

		return section;
	};

	const qfSection = makeSection(
		t("tournamentLocal.quarterFinals"),
		bracket.quarterfinal,
		t("tournamentLocal.match")
	);

	const sfSection = makeSection(
		t("tournamentLocal.semiFinals"),
		bracket.semifinal,
		t("tournamentLocal.semi"),
		"xl:pt-10"
	);

	const finalSection = document.createElement("section");
	finalSection.className = "w-full min-w-0 flex flex-col gap-3 xl:pt-24";

	const finalTitle = document.createElement("h3");
	finalTitle.textContent = t("tournamentLocal.final");
	finalTitle.className = "text-white/80 text-base sm:text-lg font-semibold px-1";
	finalSection.appendChild(finalTitle);
	finalSection.appendChild(renderMatch(bracket.final, t("tournamentLocal.final")));

	layout.appendChild(qfSection);
	layout.appendChild(sfSection);
	layout.appendChild(finalSection);

	root.appendChild(layout);
	return root;
}

function getPlayersFromInputs(count = 8): Player[] {
	const players: Player[] = [];
	let botIndex = 1;

	for (let i = 1; i <= count; i++) {
		const el = document.getElementById(`player-${i}`) as HTMLInputElement | null;
		const raw = (el?.value ?? "").trim();

		if (raw.length === 0)
			players.push({ id: i, name: `${t("tournamentLocal.bot")} ${botIndex++}`, ai: true });
		else
			players.push({ id: i, name: raw, ai: false });
	}
	return players;
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function applyResultAndAdvance(t: TournamentState, played: Match, res: GameResult) {
	played.score = { s1: res.s1, s2: res.s2 };
	const winner = res.winnerSide === 1 ? played.p1 : played.p2;

	if (t.stage === "QF") {
		const semiIndex = Math.floor(t.qfIndex / 2);
		const slotIsP1 = t.qfIndex % 2 === 0;

		if (slotIsP1)
			t.bracket.semifinal[semiIndex].p1 = winner;
		else
			t.bracket.semifinal[semiIndex].p2 = winner;

		t.qfIndex++;
		if (t.qfIndex >= 4) {
			t.stage = "SF";
			t.sfIndex = 0;
		}
		return;
	}

	if (t.stage === "SF") {
		if (t.sfIndex === 0)
			t.bracket.final.p1 = winner;
		else
			t.bracket.final.p2 = winner;

		t.sfIndex++;

		if (t.sfIndex >= 2)
			t.stage = "F";
		return;
	}

	if (t.stage === "F") {
		t.bracket.final.score = { s1: res.s1, s2: res.s2 };
		t.champion = winner;
		t.stage = "DONE";
	}
}

function buildBracket(inner: HTMLDivElement) {
	if (!gTournament) {
		const players = getPlayersFromInputs(8);
		const hasBot = players.some((p) => p.ai);

		if (hasBot) {
			chooseAiLvl(inner, (lvl) => {
				gTournament = initTournamentFromInput(players, lvl);
				buildBracket(inner);
			});
			return;
		}
		gTournament = initTournamentFromInput(players, null);
	}

	inner.innerHTML = "";
	inner.className = "w-full h-full min-h-0 flex flex-col";

	const header = document.createElement("div");
	header.className = `
		w-full shrink-0
		flex justify-end
		px-2 sm:px-4
		pt-2 sm:pt-4
	`;

	const exit = document.createElement("button");
	exit.className = `
		px-3 sm:px-4 py-2 rounded-xl
		bg-red-600 hover:bg-red-700
		text-white font-semibold
		text-sm sm:text-base
		shadow-lg
	`;
	exit.textContent = t("common.exit");
	exit.onclick = () => {
		gTournament = null;
		getRouter().lazyLoad("/game-local");
	};
	header.appendChild(exit);

	const content = document.createElement("div");
	content.className = `
		w-full flex-1 min-h-0
		overflow-y-auto overflow-x-hidden
		px-2 sm:px-4
		py-3 sm:py-4
	`;

	const bracketWrap = document.createElement("div");
	bracketWrap.className = "w-full";
	bracketWrap.appendChild(renderBracket(gTournament.bracket));
	content.appendChild(bracketWrap);

	if (gTournament.stage === "DONE" && gTournament.champion)
		content.appendChild(renderChampion(gTournament.champion));

	const footer = document.createElement("div");
	footer.className = `
		w-full shrink-0
		flex justify-center
		px-2 sm:px-4
		pb-2 sm:pb-4
		pt-2
	`;

	const btnClasses = `
		w-full
		flex flex-row
		p-3 sm:p-4
		justify-center items-center
		rounded-xl
		text-sm sm:text-base
	`;

	const label =
		gTournament.stage === "DONE"
			? t("tournamentLocal.restartTournament")
			: t("tournamentLocal.playNextMatch");

	const button = makeButtonBlock(
		"bg-blue-300 dark:bg-blue-900",
		createButton({
			id: "continue",
			extraClasses: btnClasses,
			buttonText: label,
			icon: "assets/images/enter-svgrepo-com.svg",
			f: () => {
				if (gTournament?.stage === "DONE") {
					gTournament = null;
					const outer = inner.parentElement;
					if (!outer)
						return;
					outer.replaceWith(createLocalTournament());
				} else {
					playNextMatch(inner);
				}
			},
			iconAlt: "Icon",
			iconBClass: "h-8 sm:h-10 pr-2 sm:pr-3 dark:invert",
		})
	);

	(button as HTMLElement).style.width = "100%";
	(button as HTMLElement).style.maxWidth = "24rem";

	footer.appendChild(button);

	inner.appendChild(header);
	inner.appendChild(content);
	inner.appendChild(footer);
}

function buildBracketFromPlayers(players: Player[]): Bracket {
	if (players.length !== 8)
		throw new Error("Bracket requires exactly 8 players.");

	const quarterfinal: Match[] = [];
	let id = 1;

	for (let i = 0; i < 8; i += 2)
		quarterfinal.push({ id: id++, p1: players[i], p2: players[i + 1] });

	const TBA: Player = { id: -1, name: "TBA", ai: false };

	const semifinal: Match[] = [
		{ id: id++, p1: TBA, p2: TBA },
		{ id: id++, p1: TBA, p2: TBA },
	];

	const final: Match = { id: id++, p1: TBA, p2: TBA };

	return { quarterfinal, semifinal, final };
}

async function CreateMatch(
	inner: HTMLDivElement,
	match: Match,
	onDone: (res: GameResult) => void
) {
	let swapped = false;

	if (match.p1.ai && !match.p2.ai) {
		[match.p1, match.p2] = [match.p2, match.p1];
		swapped = true;
	}

	if (match.p1.ai && match.p2.ai) {
		const winnerSide: 1 | 2 = Math.random() < 0.5 ? 1 : 2;
		const loserScore = 0;
		const winScore = 1; // modif quand change score pour win

		const s1 = winnerSide === 1 ? winScore : loserScore;
		const s2 = winnerSide === 2 ? winScore : loserScore;

		onDone({ winnerSide, s1, s2 });
		return;
	}

	inner.innerHTML = "";
	inner.className = "w-full h-full min-h-0 flex flex-col";

	const header = document.createElement("div");
	header.className = "w-full shrink-0 flex justify-end px-2 sm:px-4 pt-2 sm:pt-4";

	const exit = document.createElement("button");
	exit.className = `
		px-3 sm:px-4 py-2 rounded-xl
		bg-red-600 hover:bg-red-700
		text-white font-semibold
		text-sm sm:text-base
		shadow-lg
	`;
	exit.textContent = t("common.exit");
	header.appendChild(exit);
	inner.appendChild(header);

	const body = document.createElement("div");
	body.className = `
		w-full flex-1 min-h-0
		flex items-center justify-center
		px-2 sm:px-4
		py-2 sm:py-4
		overflow-hidden
	`;
	inner.appendChild(body);

	const gameShell = document.createElement("div");
	gameShell.className = `
		w-full max-w-6xl
		h-full
		flex items-center justify-center
	`;
	body.appendChild(gameShell);

	const gameWrap = document.createElement("div");
	gameWrap.className = `
		w-full
		max-h-full
		aspect-[10/16]
		min-[480px]:aspect-[4/5]
		sm:aspect-[16/10]
		lg:aspect-[16/9]
		rounded-2xl
		overflow-hidden
		bg-black
		border border-white/10
		shadow-2xl
	`;
	gameShell.appendChild(gameWrap);

	const canvas = document.createElement("canvas");
	canvas.className = "block w-full h-full";
	gameWrap.appendChild(canvas);

	const ctx = canvas.getContext("2d");
	if (!ctx)
		throw new Error("2D context not supported");

	let controller: ReturnType<typeof startPong> | null = null;
	let unbindKeys: null | (() => void) = null;

	const resizeCanvasToContainer = () => {
		const r = gameWrap.getBoundingClientRect();
		const width = Math.max(280, Math.floor(r.width));
		const height = Math.max(360, Math.floor(r.height));

		canvas.width = width;
		canvas.height = height;
		fitCanvasToDisplay(canvas);
		controller?.resize(width, height);
	};

	const onResize = () => {
		resizeCanvasToContainer();
	};

	const cleanUpAndExit = () => {
		gTournament = null;
		window.removeEventListener("resize", onResize);
		unbindKeys?.();
		controller?.stop();
		getRouter().lazyLoad("/game-local");
	};

	exit.onclick = cleanUpAndExit;

	const events = {
		onGameOver: (winner: 1 | 2 | 3 | 4, s1: number, s2: number) => {
			if (winner !== 1 && winner !== 2)
				return;

			controller?.stop();
			window.removeEventListener("resize", onResize);
			unbindKeys?.();

			onDone({ winnerSide: winner, s1, s2 });
		},
	};

	resizeCanvasToContainer();
	controller = startPong(canvas, ctx, { mode: "1v1", tournament: true }, {}, events);

	if (gTournament?.aiLvl) {
		const genome = genomeForDifficulty(gTournament.aiLvl, hardGenome);
		const aiP2 = makeAIPolicyP2(genome);

		const p1IsAI = match.p1.ai;
		const p2IsAI = match.p2.ai;

		if (!p1IsAI && p2IsAI) {
			const keysDown = createKeyMap();
			const keysPressed = createKeyMap();
			unbindKeys = bindKeyboard(keysDown, keysPressed);

			controller.setInputSource((state: PongState, dt: number) => {
				const kb = keyboardToInput(keysDown, keysPressed);
				const ai = aiP2(state, dt);
				return mergeKeyboardWithAIP2(kb, ai);
			});
		}
	}

	window.addEventListener("resize", onResize);
}

function getNextMatch(t: TournamentState): { match: Match; label: string } | null {
	if (t.stage === "QF") {
		const match = t.bracket.quarterfinal[t.qfIndex];
		return { match, label: `Match ${t.qfIndex + 1}` };
	}
	if (t.stage === "SF") {
		const match = t.bracket.semifinal[t.sfIndex];
		return { match, label: `Semi ${t.sfIndex + 1}` };
	}
	if (t.stage === "F")
		return { match: t.bracket.final, label: "Final" };
	return null;
}

function playNextMatch(inner: HTMLDivElement) {
	if (!gTournament)
		return;

	const next = getNextMatch(gTournament);
	if (!next) {
		buildBracket(inner);
		return;
	}

	CreateMatch(inner, next.match, (res) => {
		applyResultAndAdvance(gTournament!, next.match, res);
		buildBracket(inner);
	});
}

export default function createLocalTournament(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	if (gTournament)
		buildBracket(inner);
	else {
		const scrollArea = document.createElement("div");

		outer.className = `
			w-full h-full min-h-0
			flex flex-col items-center
			px-3 py-3 sm:px-4 md:px-6
		`;

		inner.className = `
			w-full max-w-7xl
			flex flex-1 min-h-0 flex-col
			items-center
		`;

		scrollArea.className = `
			w-full flex-1 min-h-0
			overflow-y-auto overflow-x-hidden
			flex flex-col items-center
			gap-4 sm:gap-6
			pr-1
		`;

		const formBlock = document.createElement("div");
		formBlock.className = `
			w-full max-w-2xl
			flex flex-col gap-3
			p-4 sm:p-6
			bg-blue-300 dark:bg-blue-900
			rounded-2xl
			shrink-0
		`;

		const title = document.createElement("h2");
		title.textContent = t("tournamentLocal.enterPlayerNames");
		title.className = "text-white text-xl sm:text-2xl font-semibold self-start mb-1 sm:mb-2";
		formBlock.appendChild(title);

		for (let i = 1; i <= 8; i++) {
			formBlock.appendChild(
				createTextInput(`player-${i}`, `${t("tournamentLocal.playerNamePlaceholder")} ${i}`)
			);
		}

		const btnClasses = `
			w-full
			flex flex-row
			p-3 sm:p-4
			justify-center items-center
			rounded-xl
			text-sm sm:text-base
		`;

		const button = makeButtonBlock(
			"bg-blue-300 dark:bg-blue-900",
			createButton({
				id: "continue",
				extraClasses: btnClasses,
				buttonText: t("tournamentLocal.continue"),
				icon: "assets/images/enter-svgrepo-com.svg?raw",
				f: () => buildBracket(inner),
				iconAlt: "Icon",
				iconBClass: "h-8 sm:h-10 pr-2 sm:pr-3 dark:invert",
			})
		);

		(button as HTMLElement).style.width = "100%";
		(button as HTMLElement).style.maxWidth = "24rem";
		(button as HTMLElement).classList.add("shrink-0");

		scrollArea.appendChild(formBlock);
		scrollArea.appendChild(button);
		inner.appendChild(scrollArea);
	}

	
	outer.appendChild(inner);

	return outer;
}