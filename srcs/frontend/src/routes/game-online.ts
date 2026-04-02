/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game-online.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 16:52:45 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/01 19:07:14 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import createBackButton from "../components/button/backButton.js";
import { createButton } from "../components/button/button.js";
import makeButtonBlock from "../components/button/buttonBlock.js";
import { getRouter } from "../handler/routeHandler.js";
import { createOnlineMatch, createOnlineTournament } from "../services/online.js";
import { setCurrentMatchId, getCurrentMatchId, setCurrentTournamentId } from "../services/onlineStore.js";


export default function createGameOnlinePage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	outer.append(createBackButton("bg-green-300 dark:bg-green-900", "/"));
	
	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-green-300 dark:bg-green-800", createButton({
			id: "create-match-button",
			extraClasses:btnClasses,
			buttonText: "Create Match",
			f: () => {
				getRouter().lazyLoad("/online-mode");
			},
			icon: "assets/images/plus-large-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-lime-200 dark:bg-lime-800", createButton({
			id: "create-tournament-button",
			extraClasses: btnClasses,
			buttonText: "Create Tournament",
			f: async () => {
				const tournament = await createOnlineTournament();
				setCurrentTournamentId(String(tournament.id));
				getRouter().lazyLoad("/online-tournament");
			},
			icon: "assets/images/trophy-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-emerald-300 dark:bg-emerald-900", createButton({
			id: "browse-matches-button",
			extraClasses: btnClasses,
			buttonText: "Browse Games",
			href: "/browse-games",
			f: async () => {
				getRouter().lazyLoad("/choose-browse");
			},
			icon: "assets/images/list-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
		}))
	);

	outer.appendChild(inner);

	return outer;
}