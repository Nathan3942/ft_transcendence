/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   local-tournament.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/02 16:32:13 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/02 18:22:29 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
// import { creatTextInput } from "../components/TextInput/TextInput";

type Player = {
    id: number;
    name: string;
    ai: boolean;
};

type Match = {
    id: number;
    p1: Player;
    p2: Player;
};

type Bracket = {
    quarterfinal: Match[];
    semifinal: Match[];
    final: Match;
}

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
	row1.textContent = match.p1.name;
	row1.className = "p-1 rounded bg-white/5";

	const row2 = document.createElement("div");
	row2.className = "flex items-center justify-between p-2 rounded-lg bg-white/5 mt-2";
	row2.textContent = match.p2.name;
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


function createBracket(players: Player[]): Bracket {

	if (players.length !== 8) {
		throw new Error("Bracket requires exactly 8 players.");
	}

	const quarterfinal: Match[] = [];
	let matchId = 1;

	for (let i = 0; i < 8; i += 2) {
		quarterfinal.push({
			id: matchId++,
			p1: players[i],
			p2: players[i + 1],
		});
	}

	const TBA: Player = { id: -1, name: "TBA", ai: false };

	const semifinal: Match[] = [
		{ id: matchId++, p1: TBA, p2: TBA },
		{ id: matchId++, p1: TBA, p2: TBA },
	];

	const final: Match = { id: matchId++, p1: TBA, p2: TBA };
	return {quarterfinal, semifinal, final };

}

function CreateBracket(inner: HTMLDivElement) {
	const players = getPlayersFromInputs(8);

	const seeded = shuffle(players);

	const bracket = createBracket(seeded);

	inner.innerHTML = "";

	inner.className = "w-full flex flex-col items-center";
	inner.appendChild(renderBracket(bracket));

	console.log("players:", players);
	console.log("seeded:", seeded);
	console.log("bracket:", bracket);
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
            icon: "assets/images/robot-svgrepo-com.svg",
            f: () => CreateBracket(inner),
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