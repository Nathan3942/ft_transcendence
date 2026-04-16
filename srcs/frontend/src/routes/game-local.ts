import { createButton } from "../components/button/button.js";
import makeButtonBlock from "../components/button/buttonBlock.js";

import { startPong } from "../game/pong.js";
/* MODIF 1 : on importe PongEvents pour typer le callback onGameOver */
import type { ModeId, PongEvents } from "../game/pong_core.js";
import { getRouter } from "../handler/routeHandler.js";
import createLocalTournament from "./tournament-local.js";

/* URL de base de l'API backend */
const API_URL = `http://${window.location.hostname}:3000/api/v1`;

/* MODIF 2 : createLocalMatch prend maintenant les noms des joueurs en paramètre
   et fait 2 appels API :
   - avant le match : POST /users pour créer/récupérer les 2 joueurs (obtenir leurs IDs)
   - après le match : POST /matches/result pour sauvegarder le score en base */
async function createLocalMatch(outer: HTMLDivElement, p1Name: string, p2Name: string)
{
	/* Etape A : créer ou récupérer les 2 joueurs dans le backend */

	/* variable vide ce qui bloque le jeu */
	// const res1 = await fetch(`${API_URL}/users`, {
	// 	method: "POST",
	// 	headers: { "Content-Type": "application/json" },
	// 	body: JSON.stringify({ username: p1Name }),
	// });
	// const res2 = await fetch(`${API_URL}/users`, {
	// 	method: "POST",
	// 	headers: { "Content-Type": "application/json" },
	// 	body: JSON.stringify({ username: p2Name }),
	// });
	// const p1Id = (await res1.json()).data.id;
	// const p2Id = (await res2.json()).data.id;

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

	/* Etape B : callback appelé quand le match se termine
	   → envoie le résultat au backend via POST /matches/result */
	const events: PongEvents = {
		onGameOver: async (winner: 1 | 2 | 3 | 4, s1: number, s2: number, md: ModeId) => {
			if (winner !== 1 && winner !== 2) return;
			const winnerId = winner === 1 ? p1Id : p2Id;
			try {
				await fetch(`${API_URL}/matches/result`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						player1Id: p1Id,
						player2Id: p2Id,
						scorePlayer1: s1,
						scorePlayer2: s2,
						winnerId,
						mode: md
					}),
				});
				console.log(`Match sauvegardé : ${p1Name} ${s1} - ${s2} ${p2Name}`);
			} catch (err) {
				console.error("Erreur sauvegarde match:", err);
			}
		},
	};

	/* On passe events à startPong (le 5ème paramètre qui existait déjà) */
	const controller = startPong(canvas, ctx, { mode: "1v1", tournament: false }, {}, events);

	const onResize = () => {
		const r = outer.getBoundingClientRect();
		controller.resize(r.width || window.innerWidth, r.height || window.innerHeight);
	};
	window.addEventListener("resize", onResize);

	console.log("Start pong in local mod\n");
}

export default function createGameLocalPage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-blue-300 dark:bg-blue-900", createButton({
			id: "vs-ai-button",
			extraClasses:btnClasses,
			buttonText: "Player vs AI",
			href: "/game-local-ai",
			icon: "assets/images/robot-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-purple-300 dark:bg-purple-900", createButton({
			id: "vs-player-button",
			extraClasses: btnClasses,
			buttonText: "Player vs Player",
			/* MODIF 3 : on passe des noms par défaut pour le match PvP local */
			f: () => createLocalMatch(outer, "Player 1", "Player 2"),
			icon: "assets/images/keyboard-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		), 
		makeButtonBlock("bg-cyan-300 dark:bg-cyan-900", createButton({
			id: "create-local-tournament",
			extraClasses: btnClasses,
			buttonText: "Local Tournament",
			href: "/local-tournament",
			f: () => {
				getRouter().lazyLoad("/tournament-local");
			},
			icon: "assets/images/trophy-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
		}))
	);

	outer.appendChild(inner);

	return outer;
}