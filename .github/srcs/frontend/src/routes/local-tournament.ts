/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   local-tournament.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/02 16:32:13 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/24 17:29:02 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import { startPong } from "../game/pong";
import type { PongInput, PongState } from "../game/pong_core";

import { makeAIPolicyP2 } from "../game/ai/policy";

import { loadHardGenome, genomeForDifficulty, createKeyMap, keyboardToInput, bindKeyboard, mergeKeyboardWithAIP2 } from "./game-local-ai";

/* MODIF 1 : URL de base de l'API backend pour sauvegarder le tournoi */
const API_URL = `http://${window.location.hostname}:3000/api/v1`;

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

function mirrorStateForP2(s: PongState): PongState {
	
	const m = structuredClone(s) as PongState;

	const tmpScore = m.scoreP1;
	m.scoreP1 = m.scoreP2;
	m.scoreP2 = tmpScore;

	const left = m.playX;
	const right = m.playX + m.playW;

	m.ballX = left + (right - m.ballX);
	m.ballVX = -m.ballVX;

	if (m.paddles.length >= 2) {
		const pL = m.paddles[0];
		const pR = m.paddles[1];

		const tmpPos = pL.pos;
		pL.pos = pR.pos;
		pR.pos = tmpPos;
	}
	return (m);
}

function recenterPaddle(state: PongState, paddleIndex: 0 | 1, dead = 6): { up: boolean; down: boolean } {
	const p = state.paddles[paddleIndex];
	const target = (state.playH - p.len) / 2;
	const d = p.pos - target;

	if (d > dead)  return { up: true, down: false };
	if (d < -dead) return { up: false, down: true };
	return { up: false, down: false };
}


function chooseAiLvl(inner: HTMLDivElement, onPick: (lvl: AiLvl) => void) {
	inner.innerHTML = "";
	inner.className = "w-full flex flex-col items-center gap-6";

	const title = document.createElement("h2");
	title.textContent = "Choose AI difficulty";
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
	wrap.className = "w-72 flex flex-col gap-3";
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
	d.textContent = `🏆 Champion: ${champ.name}`;
	return (d);
}

function renderMatch(match: Match, title: string): HTMLDivElement {
	const card = document.createElement("div");
	card.className = `
		w-72 p-3 rounded-xl
		bg-slate-900/40 border border-white/10
		text-white
	`;

	const h = document.createElement("div");
	h.className = "text-sm opacity-70 mb-3";
	h.textContent = title;

	const row1 = document.createElement("div");
	row1.className = "flex items-center justify-between p-2 rounded-lg bg-white/5";
	row1.textContent = match.score ? `${match.p1.name} (${match.score.s1})` : match.p1.name;
	row1.className = "p-1 rounded bg-white/5";

	const row2 = document.createElement("div");
	row2.className = "flex items-center justify-between p-2 rounded-lg bg-white/5 mt-2";
	row2.textContent = match.score ? `${match.p2.name} (${match.score.s2})` : match.p2.name;
	row2.className = "p-1 rounded bg-white/5 mt-1";

	card.appendChild(h);
	card.appendChild(row1);
	card.appendChild(row2);

	return card;
}

function renderBracket(bracket: Bracket): HTMLDivElement {

  const root = document.createElement("div");
  root.className = "w-full max-w-6xl mx-auto mt-10";

  const header = document.createElement("div");
  header.className = "grid gap-x-12 mb-6";
  header.style.gridTemplateColumns = "repeat(3, 1fr)";

  const mkTitle = (txt: string) => {
    const t = document.createElement("div");
    t.textContent = txt;
    t.className = "text-white/80 text-base text-center";
    return t;
  };

  header.appendChild(mkTitle("Quarterfinals"));
  header.appendChild(mkTitle("Semifinals"));
  header.appendChild(mkTitle("Final"));


  const body = document.createElement("div");
  body.className = "grid gap-x-12 items-center justify-items-center";
  body.style.gridTemplateColumns = "repeat(3, 1fr)";
  body.style.gridTemplateRows = "repeat(7, auto)";


  body.style.rowGap = "2px";

  const place = (el: HTMLElement, col: number, row: number) => {
    el.style.gridColumnStart = String(col);
    el.style.gridRowStart = String(row);
  };

  const qRows = [1, 3, 5, 7];
  bracket.quarterfinal.forEach((m, i) => {
    const card = renderMatch(m, `Match ${i + 1}`);
    place(card, 1, qRows[i]);
    body.appendChild(card);
  });

  const sRows = [2, 6];
  bracket.semifinal.forEach((m, i) => {
    const card = renderMatch(m, `Semi ${i + 1}`);
    place(card, 2, sRows[i]);
    body.appendChild(card);
  });

  const finalCard = renderMatch(bracket.final, "Final");
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
			players.push({ id: i, name: `Bot ${botIndex++}`, ai: true });
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

		/* MODIF 2 : quand le tournoi est terminé, on envoie toutes les données au backend
		   via POST /tournaments/result. On collecte :
		   - les joueurs (nom + si c'est une IA)
		   - tous les matchs joués (scores + gagnant + round)
		   - le nom du champion */
		saveTournamentToBackend(t);
	}
}

/**
 * Collecte les données du tournoi terminé et les envoie au backend
 * Le backend crée les users, le tournoi, les matchs en une seule requête
 */
async function saveTournamentToBackend(t: TournamentState) {
	/* Récupérer tous les joueurs uniques du bracket */
	const playerSet = new Set<string>();
	const playersData: { name: string; isAi: boolean }[] = [];

	const allMatches = [
		...t.bracket.quarterfinal,
		...t.bracket.semifinal,
		t.bracket.final,
	];

	for (const m of allMatches) {
		for (const p of [m.p1, m.p2]) {
			if (!playerSet.has(p.name)) {
				playerSet.add(p.name);
				playersData.push({ name: p.name, isAi: p.ai });
			}
		}
	}

	/* Construire la liste des matchs avec scores (seulement ceux joués) */
	let roundNum = 1;
	const matchesData = allMatches
		.filter(m => m.score) /* seulement les matchs joués */
		.map((m) => {
			const winner = m.score!.s1 > m.score!.s2 ? m.p1 : m.p2;
			return {
				player1Name: m.p1.name,
				player2Name: m.p2.name,
				scorePlayer1: m.score!.s1,
				scorePlayer2: m.score!.s2,
				winnerName: winner.name,
				round: roundNum++,
			};
		});

	/* Nom unique pour le tournoi (avec timestamp pour éviter les doublons) */
	const tournamentName = `Tournament ${new Date().toLocaleString()}`;

	try {
		const res = await fetch(`${API_URL}/tournaments/result`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: tournamentName,
				players: playersData,
				matches: matchesData,
				championName: t.champion!.name,
			}),
		});
		const json = await res.json();
		console.log("Tournoi sauvegardé:", json);
	} catch (err) {
		console.error("Erreur sauvegarde tournoi:", err);
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

	const btnClasses = "w-full flex flex-row p-3 justify-center items-center rounded-xl";

	const label = gTournament.stage === "DONE" ? "Restart tournament" : "Play next match";

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

	(button as HTMLElement).style.width = "18rem";
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
    
    inner.innerHTML = "";

    const gameWrap = document.createElement("div");
	gameWrap.className = "w-screen h-[92vh]";
	inner.appendChild(gameWrap);

	const canvas = document.createElement("canvas");
	canvas.className = "w-full h-full";
	gameWrap.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("2D context not supported");

    const rect = gameWrap.getBoundingClientRect();
    canvas.width = rect.width || window.innerWidth;
    canvas.height = rect.height || window.innerHeight;

	let controller: ReturnType<typeof   startPong> | null = null;
	let unbindKeys: null | (() => void) = null;

	const onResize = () => {
		const r = gameWrap.getBoundingClientRect();
		controller?.reseize(r.width || window.innerWidth, r.height || window.innerHeight);
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
		const hg = await loadHardGenome();
		const genome = genomeForDifficulty(gTournament.aiLvl, hg);

		const aiP2 = makeAIPolicyP2(genome);

		const p1IsAI = match.p1.ai;
		const p2IsAI = match.p2.ai;

		// 1) Humain vs IA
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
		// 3) IA vs IA
		else if (p1IsAI && p2IsAI) {
			controller.setInputSource((state: PongState, dt: number) => {
				const autoStart = state.phase === "LOBBY";

				const towardP2 = state.ballVX > 0;
				const towardP1 = state.ballVX < 0;

				const aiForP2 = aiP2(state, dt);

				const mirrored = mirrorStateForP2(state);
				const aiMirrored = aiP2(mirrored, dt);

				const p2Move = towardP2
				? { up: aiForP2.p2.up, down: aiForP2.p2.down }
				: recenterPaddle(state, 1);

				const p1Move = towardP1
				? { up: aiMirrored.p2.up, down: aiMirrored.p2.down }
				: recenterPaddle(state, 0);

				return {
				p1: { ...p1Move, start: autoStart, togglePause: false },
				p2: { ...p2Move, start: autoStart, togglePause: false },
				p3: { up: false, down: false, start: autoStart },
				p4: { up: false, down: false, start: autoStart },
				};
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

	outer.className = "flex flex-1 flex-col justify-center items-center";
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-center gap-8";

    const fromBlock = document.createElement("div");
    fromBlock.className = "w-full flex flex-col gap-3 p-6 bg-blue-300 dark:bg-blue-900 rounded-xl";

    const title = document.createElement("h2");
    title.textContent = "Enter players names";
    title.className = `
        text-white text-2xl font-semibold
        self-start mb-2
    `;
    fromBlock.appendChild(title);

    for (let i = 1; i <= 8; i++) {
        fromBlock.appendChild(createTextInput(`player-${i}`, `Player name ${i}`));
    }

    const btnClasses = "w-1/2 flex flex-row p-4 justify-center";

    const button = makeButtonBlock(
        "bg-blue-300 dark:bg-blue-900",
        createButton({
            id: "continue",
            extraClasses: btnClasses,
            buttonText: "Continue",
            icon: "assets/images/enter-svgrepo-com.svg",
            f: () => buildBracket(inner),
            iconAlt: "Icon",
            iconBClass: "h-10 pr-3 dark:invert"
        })
    );

	const bracketContainer = document.createElement("div");
	bracketContainer.id = "bracket-container";
	bracketContainer.className = "w-9/12";
	inner.appendChild(bracketContainer);

    inner.appendChild(fromBlock);
    inner.appendChild(button);
    outer.appendChild(inner);

	return outer;
}