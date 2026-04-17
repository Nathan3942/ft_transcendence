/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tournament-local.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/02 16:32:13 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/17 12:00:00 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import createSoftBackLoad from "../components/button/softLoadButton";
import { t } from "../i18n/i18n";
import { startPong } from "../game/pong";
import type { PongInput, PongState } from "../game/pong_core";

import { makeAIPolicyP2 } from "../game/ai/policy";

import { loadHardGenome, genomeForDifficulty, createKeyMap, keyboardToInput, bindKeyboard, mergeKeyboardWithAIP2 } from "./game-local-ai";
import hardGenome from "../game/ai/genomes/hard.json";


type Player = {
    id: number;
    name: string;
    ai: boolean;
};

type Match = {
    id: number;
    p1: Player;
    p2: Player;
    score?: { s1: number, s2: number };
};

type Bracket = {
    quarterfinal: Match[];
    semifinal: Match[];
    final: Match;
}

type GameResult = {
    winnerSide: 1 | 2;
    s1: number;
    s2: number;
}

type Stage = "QF" | "SF" | "F" | "DONE";

type AiLvl = "easy" | "medium" | "hard";

type TournamentState = {
    bracket: Bracket;
    stage: Stage;
    qfIndex: number;
    sfIndex: number;
    champion: Player | null;
	aiLvl: "easy" | "medium" | "hard" | null;
}

let gTournament: TournamentState | null = null;

function createTextInput(id: string, placeholder: string): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.placeholder = placeholder;

    input.className = `
        w-full p-3 rounded-lg
        bg-white dark:bg-slate-800
        text-black dark:text-white
        border border-gray-300 dark:border-gray-600
        focus:outline-none focus:ring-2 focus:ring-blue-500
    `;

    return input;
}


function chooseAiLvl(inner: HTMLDivElement, onPick: (lvl: AiLvl) => void) {
	inner.innerHTML = "";
	inner.className = "w-full flex flex-col items-center gap-4 sm:gap-6 px-4";

	const title = document.createElement("h2");
	title.textContent = t("tournamentLocal.chooseAiDifficulty");
	title.className = "text-white text-2xl font-semibold";
	inner.appendChild(title);

	const btnClasses = "w-full flex flex-row p-4 justify-center items-center rounded-xl";

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

	const wrap = document.createElement("div");
	wrap.className = "w-full max-w-xs sm:max-w-sm flex flex-col gap-3";
	wrap.appendChild(makePickBtn("diff-easy-btn", "Easy", "bg-blue-300 dark:bg-blue-900", "easy"));
	wrap.appendChild(makePickBtn("diff-medium-btn", "Medium", "bg-purple-300 dark:bg-purple-900", "medium"));
	wrap.appendChild(makePickBtn("diff-hard-btn", "Hard", "bg-red-300 dark:bg-red-900", "hard"));

	inner.appendChild(wrap);
}

function initTournamentFromInput(players: Player[] ,aiLvl: AiLvl | null): TournamentState {
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
	d.className = "mt-6 text-white text-3xl font-semibold";
	d.textContent = `🏆 ${t("tournamentLocal.champion")}: ${champ.name}`;

	return (d);
}

function renderMatch(match: Match, title: string): HTMLDivElement {
	const card = document.createElement("div");
	card.className = `w-full max-w-xs sm:max-w-sm p-3 rounded-xl bg-slate-900/40 border border-white/10 text-white`;

	const h = document.createElement("div");
	h.className = "text-sm opacity-70 mb-3";
	h.textContent = title;

	const row1 = document.createElement("div");
	row1.className = "flex items-center justify-between p-2 rounded-lg bg-white/5";
	row1.textContent = match.score ? `${match.p1.name} (${match.score.s1})` : match.p1.name;

	const row2 = document.createElement("div");
	row2.className = "flex items-center justify-between p-2 rounded-lg bg-white/5 mt-2";
	row2.textContent = match.score ? `${match.p2.name} (${match.score.s2})` : match.p2.name;

	card.appendChild(h);
	card.appendChild(row1);
	card.appendChild(row2);

	return card;
}

function renderBracket(bracket: Bracket): HTMLDivElement {

	const root = document.createElement("div");
	root.className = "w-full max-w-6xl mx-auto mt-6 sm:mt-10 px-2 sm:px-4";

	const isMobile = window.innerWidth < 768;

	if (isMobile) {
		root.className += " flex flex-col gap-6";

		const makeSection = (title: string, matches: Match[], labelPrefix: string) => {
			const section = document.createElement("div");
			section.className = "flex flex-col gap-3";

			const h = document.createElement("h3");
			h.textContent = title;
			h.className = "text-white/80 text-lg font-semibold";
			section.appendChild(h);

			matches.forEach((m, i) => {
				section.appendChild(renderMatch(m, `${labelPrefix} ${i + 1}`));
			});

			return section;
		};

		root.appendChild(makeSection("Quarterfinals", bracket.quarterfinal, "Match"));
		root.appendChild(makeSection("Semifinals", bracket.semifinal, "Semi"));

		const finalSection = document.createElement("div");
		finalSection.className = "flex flex-col gap-3";

		const finalTitle = document.createElement("h3");
		finalTitle.textContent = "Final";
		finalTitle.className = "text-white/80 text-lg font-semibold";
		finalSection.appendChild(finalTitle);
		finalSection.appendChild(renderMatch(bracket.final, "Final"));

		root.appendChild(finalSection);
		return root;
	}

	const header = document.createElement("div");
	header.className = "grid gap-x-6 lg:gap-x-12 mb-6";
	header.style.gridTemplateColumns = "repeat(3, 1fr)";

	const mkTitle = (txt: string) => {
		const t = document.createElement("div");
		t.textContent = txt;
		t.className = "text-white/80 text-sm sm:text-base text-center";
		return t;
	};

	header.appendChild(mkTitle(t("tournamentLocal.quarterFinals")));
	header.appendChild(mkTitle(t("tournamentLocal.semiFinals")));
	header.appendChild(mkTitle(t("tournamentLocal.final")));

	const body = document.createElement("div");
	body.className = "grid gap-x-6 lg:gap-x-12 items-center justify-items-center";
	body.style.gridTemplateColumns = "repeat(3, 1fr)";
	body.style.gridTemplateRows = "repeat(7, auto)";
	body.style.rowGap = "8px";

	const place = (el: HTMLElement, col: number, row: number) => {
		el.style.gridColumnStart = String(col);
		el.style.gridRowStart = String(row);
	};

	const qRows = [1, 3, 5, 7];
	bracket.quarterfinal.forEach((m, i) => {
		const card = renderMatch(m, `${t("tournamentLocal.match")} ${i + 1}`);
		place(card, 1, qRows[i]);
		body.appendChild(card);
	});

	const sRows = [2, 6];
	bracket.semifinal.forEach((m, i) => {
		const card = renderMatch(m, `${t("tournamentLocal.semi")} ${i + 1}`);
		place(card, 2, sRows[i]);
		body.appendChild(card);
	});

	const finalCard = renderMatch(bracket.final, t("tournamentLocal.final"));
	place(finalCard, 3, 4);
	body.appendChild(finalCard);

	root.appendChild(header);
	root.appendChild(body);
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
	return (players);
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return (a);
}


function applyResultAndAdvance(t: TournamentState, played: Match, res: GameResult) {
    
    played.score = { s1: res.s1, s2: res.s2 };
    const winner = res.winnerSide === 1 ? played.p1 : played.p2;

    if (t.stage === "QF") {
        const semiIndex = Math.floor(t.qfIndex / 2);
        const slotIsP1 = (t.qfIndex % 2 === 0);

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

		if (t.sfIndex >= 2) {
		t.stage = "F";
		}
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
		const hasBot = players.some(p => p.ai);

		for (const p of players)
			console.log(p.name);

		if (hasBot) {
			chooseAiLvl(inner, (lvl) => {
				gTournament = initTournamentFromInput(players ,lvl);
				buildBracket(inner);
			});
			return;
		}
		else {
			gTournament = initTournamentFromInput(players ,null);
		}
	}
	
	console.log(gTournament.aiLvl);

	inner.innerHTML = "";
	inner.className = "w-full flex flex-col items-center";

	inner.appendChild(renderBracket(gTournament.bracket));

	if (gTournament.stage === "DONE" && gTournament.champion) {
		inner.appendChild(renderChampion(gTournament.champion));
	}

	const btnClasses = "w-full flex flex-row p-3 sm:p-4 justify-center items-center rounded-xl";

	const label = gTournament.stage === "DONE" ? t("tournamentLocal.restartTournament") : t("tournamentLocal.playNextMatch");

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
				}
				else {
					playNextMatch(inner);
				}
			},
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert",
		})
	);

	(button as HTMLElement).style.width = "100%";
	(button as HTMLElement).style.maxWidth = "18rem";
	(button as HTMLElement).style.margin = "0 auto";
	inner.appendChild(button);
}


function buildBracketFromPlayers(players: Player[]): Bracket {
	if (players.length !== 8)
		throw new Error("Bracket requires exactly 8 players.");

	const quarterfinal: Match[] = [];
	let id = 1;

	for (let i = 0; i < 8; i += 2) {
		quarterfinal.push({ id: id++, p1: players[i], p2: players[i + 1] });
	}

	const TBA: Player = { id: -1, name: "TBA", ai: false };

	const semifinal: Match[] = [
		{ id: id++, p1: TBA, p2: TBA },
		{ id: id++, p1: TBA, p2: TBA },
	];

	const final: Match = { id: id++, p1: TBA, p2: TBA };

	return { quarterfinal, semifinal, final };
}


async function CreateMatch(inner: HTMLDivElement, match: Match, onDone: (res: GameResult) => void) {
    
	let swapped = false;

	if (match.p1.ai && !match.p2.ai) {
		[match.p1, match.p2] = [match.p2, match.p1];
		swapped = true;
	}

	if (match.p1.ai && match.p2.ai) {
		const winnerSide: 1 | 2 = Math.random() < 0.5 ? 1 : 2;

		const loserScore = Math.floor(Math.random() * 1);
		const winScore = 1;

		const s1 = winnerSide === 1 ? winScore : loserScore;
		const s2 = winnerSide === 2 ? winScore : loserScore;

		onDone({ winnerSide, s1, s2 });
		return;
	}
	
    inner.innerHTML = "";

    const gameWrap = document.createElement("div");
	gameWrap.className = "w-full h-[70vh] sm:h-[85vh] max-h-screen";
	inner.appendChild(gameWrap);

	const canvas = document.createElement("canvas");
	canvas.className = "w-full h-full";
	gameWrap.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("2D context not supported");

    const rect = gameWrap.getBoundingClientRect();
    canvas.width = Math.max(320, rect.width || window.innerWidth);
	canvas.height = Math.max(400, rect.height || window.innerHeight);

	let controller: ReturnType<typeof   startPong> | null = null;
	let unbindKeys: null | (() => void) = null;

	const onResize = () => {
		const r = gameWrap.getBoundingClientRect();
		controller?.resize(r.width || window.innerWidth, r.height || window.innerHeight);
	};

	const events = {
		onGameOver: (winner: 1 | 2 | 3 | 4, s1: number, s2: number) => {
			if (winner !== 1 && winner !== 2) return;

			controller?.stop();
			window.removeEventListener("resize", onResize);
			unbindKeys?.();

			onDone({ winnerSide: winner, s1, s2 });
		},
	};

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

	console.log("Start pong in local mod\n");
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
    if (t.stage === "F") {
        return { match: t.bracket.final, label: "Final" };
    }
    return (null);
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
	})
}


export default function createLocalTournament(): HTMLDivElement {

    const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-1 flex-col items-center px-4 py-4 sm:px-6";
	inner.className = "w-full max-w-6xl flex flex-col items-center gap-6 sm:gap-8";

	outer.append(createSoftBackLoad("bg-cyan-300 dark:bg-cyan-900", "/game-local"))

    const fromBlock = document.createElement("div");
    fromBlock.className = `w-full max-w-2xl flex flex-col gap-3 p-4 sm:p-6 bg-blue-300 dark:bg-blue-900 rounded-xl`;

    const title = document.createElement("h2");
    title.textContent = "Enter players names";
    title.className = "text-white text-xl sm:text-2xl font-semibold self-start mb-2";
    fromBlock.appendChild(title);

    for (let i = 1; i <= 8; i++) {
        fromBlock.appendChild(createTextInput(`player-${i}`, `${t("tournamentLocal.playerNamePlaceholder")} ${i}`));
    }

    const btnClasses = "w-full sm:w-1/2 flex flex-row p-4 justify-center items-center rounded-xl";

    const button = makeButtonBlock(
        "bg-blue-300 dark:bg-blue-900",
        createButton({
            id: "continue",
            extraClasses: btnClasses,
            buttonText: t("tournamentLocal.continue"),
            icon: "assets/images/enter-svgrepo-com.svg?raw",
            f: () => buildBracket(inner),
            iconAlt: "Icon",
            iconBClass: "h-10 pr-3 dark:invert"
        })
    );

    inner.appendChild(fromBlock);
    inner.appendChild(button);
    outer.appendChild(inner);

	return outer;
}