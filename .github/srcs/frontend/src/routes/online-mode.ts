/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   online-mode.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/27 10:03:13 by njeanbou          #+#    #+#             */
/*   Updated: 2026/03/09 15:17:52 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createButton } from "../components/button/button.js";
import makeButtonBlock from "../components/button/buttonBlock.js";
import { createOnlineMatch } from "../services/online.js";
import { setCurrentMatchId, setCurrentMatchMode } from "../services/onlineStore.js";
import onlineMatch from "./online-match.js";

function navigate(path: string) {
	window.dispatchEvent(new CustomEvent("navigate", { detail: { path } }));
}


export default function chooseOnlineMode(): HTMLDivElement {
	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-col flex-1 justify-center items-end"
	inner.className = "text-3xl w-9/12 h-2/3 flex flex-col items-end justify-evenly";

	const btnClasses = "w-full h-full flex flex-row p-4"; 
	inner.append(
		makeButtonBlock("bg-blue-300 dark:bg-blue-900", createButton({
			id: "1v1-mode-btn",
			extraClasses:btnClasses,
			buttonText: "1v1",
			f: async () => {
				const match = await createOnlineMatch(1);
				setCurrentMatchMode(1);
				setCurrentMatchId(String(match.id));
				navigate("/online-match");
			}
			})
		),
		makeButtonBlock("bg-purple-300 dark:bg-purple-900", createButton({
			id: "2v2-mode-btn",
			extraClasses: btnClasses,
			buttonText: "2v2",
			f: async () => {
				const match = await createOnlineMatch(2);
				setCurrentMatchMode(2);
				setCurrentMatchId(String(match.id));
				navigate("/online-match");
			}
			})
		),
		makeButtonBlock("bg-red-300 dark:bg-red-900", createButton({
			id: "3p-mode-btn",
			extraClasses: btnClasses,
			buttonText: "3 Players",
			f: async () => {
				const match = await createOnlineMatch(3);
				setCurrentMatchMode(3);
				setCurrentMatchId(String(match.id));
				navigate("/online-match");
			}
			})
		),
		makeButtonBlock("bg-red-300 dark:bg-red-900", createButton({
			id: "4p-mode-btn",
			extraClasses: btnClasses,
			buttonText: "4 Players",
			f: async () => {
				const match = await createOnlineMatch(4);
				setCurrentMatchMode(4);
				setCurrentMatchId(String(match.id));
				navigate("/online-match");
			}
			})
		)
	);

	outer.appendChild(inner);

	return outer;
}
