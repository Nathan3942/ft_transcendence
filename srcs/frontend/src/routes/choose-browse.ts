/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   choose-browse.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 15:46:15 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/16 15:16:19 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createButton } from "../components/button/button.js";
import makeButtonBlock from "../components/button/buttonBlock.js";

function navigate(path: string) {
	window.dispatchEvent(new CustomEvent("navigate", { detail: { path } }));
}

export default function chooseBrowse(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	
	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-yellow-300 dark:bg-green-900", createButton({
			id: "create-match-button",
			extraClasses:btnClasses,
			buttonText: "Browse Match",
			f: () => {
				navigate("/browse-games");
			},
			icon: "assets/images/plus-large-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
			})
		),
		makeButtonBlock("bg-yellow-400 dark:bg-yellow-900", createButton({
			id: "browse-matches-button",
			extraClasses: btnClasses,
			buttonText: "Browse Tournaments",
			// href: "/browse-games",
			f: async () => {
				navigate("/browse-tournaments");
			},
			icon: "assets/images/list-svgrepo-com.svg",
			iconAlt: "Icon",
			iconBClass: "h-10 pr-3 dark:invert"
		}))
	);

	outer.appendChild(inner);

	return outer;
}