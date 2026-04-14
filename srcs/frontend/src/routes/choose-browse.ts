/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   choose-browse.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 15:46:15 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/13 14:10:33 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import createSoftBackLoad from "../components/button/softLoadButton";
import { getRouter } from "../handler/routeHandler";
import { t } from "../i18n/i18n";


export default function chooseBrowse(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.append(createSoftBackLoad("bg-emerald-300 dark:bg-emerald-900", "/game-online"))

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	
	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-yellow-300 dark:bg-green-900", createButton({
			id: "create-match-button",
			extraClasses:btnClasses,
			buttonText: t("browse.browseMatch"),
			f: () => {
				getRouter().lazyLoad("/browse-games");
			},
			icon: "assets/images/list-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-yellow-400 dark:bg-yellow-900", createButton({
			id: "browse-matches-button",
			extraClasses: btnClasses,
			buttonText: t("browse.browseTournaments"),
			// href: "/browse-games",
			f: async () => {
				getRouter().lazyLoad("/browse-tournaments");
			},
			icon: "assets/images/list-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
		}))
	);

	outer.appendChild(inner);

	return outer;
}