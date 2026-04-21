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

import createBackButton from "../components/button/backButton";
import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import { getRouter } from "../handler/routeHandler";
import { t } from "../i18n/i18n";
import { createOnlineTournament } from "../services/online";
import { setCurrentTournamentId } from "../services/onlineStore";


export default function createGameOnlinePage(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-full md:w-9/12 h-2/3 flex flex-col items-center md:items-end justify-evenly";

	outer.append(createBackButton("bg-green-300 dark:bg-green-900", "/"));
	
	const btnClasses = "w-full h-full flex flex-row p-4 w-full"; 
	inner.append(
		makeButtonBlock("bg-green-300 dark:bg-green-800", createButton({
			id: "create-match-button",
			extraClasses:btnClasses,
			buttonText: t("gameOnline.createMatch"),
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
			buttonText: t("gameOnline.createTournament"),
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
			buttonText: t("gameOnline.browseGames"),
			href: "/browse-games",
			f: async () => {
				getRouter().navigateTo("/choose-browse");
			},
			icon: "assets/images/list-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
		}))
	);

	outer.appendChild(inner);

	return outer;
}