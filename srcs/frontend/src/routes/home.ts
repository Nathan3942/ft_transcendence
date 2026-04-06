import { createButton } from "../components/button/button";
import makeButtonBlock from "../components/button/buttonBlock";
import { t } from "../i18n/i18n";

export default function createHomePage(): HTMLDivElement {

	const outer = document.createElement("div");
	const inner = document.createElement("div");

	outer.className = "flex flex-1 flex-col justify-center items-end";
	inner.className = "text-3xl w-full md:w-9/12 h-2/3 flex flex-col items-center md:items-end justify-evenly";

	const buttonClasses: string = "w-full h-full flex flex-row p-4 w-full";
	const iconBClasses: string = "h-10 w-10 pr-2 dark:invert";

	inner.append(
		makeButtonBlock("bg-blue-300 dark:bg-blue-900", createButton({
			id: "local-button",
			extraClasses: buttonClasses,
			buttonText: t("home.localPlay"),
			icon: "assets/images/monitor-svgrepo-com.svg?raw",
			iconAlt: "Icon",
			iconBClass: iconBClasses,
			href: "/game-local"
		})),
		makeButtonBlock("bg-green-300 dark:bg-green-900", createButton({
			id: "online-button",
			extraClasses: buttonClasses,
			buttonText: t("home.onlinePlay"),
			icon: "assets/images/globe-svgrepo-com.svg?raw",
			iconAlt: "Icon",
			iconBClass: iconBClasses,
			href: "/game-online"
		})),
		makeButtonBlock("bg-red-300 dark:bg-red-900", createButton({
			id: "leaderboard-button",
			extraClasses: buttonClasses,
			buttonText: t("home.leaderboard"),
			icon: "assets/images/square-poll-vertical-svgrepo-com.svg?raw",
			iconAlt: "Icon",
			iconBClass: iconBClasses,
			href: "/leaderboard"
		})),
		makeButtonBlock("bg-purple-300 dark:bg-purple-900", createButton({
			id: "about-button",
			extraClasses: buttonClasses,
			buttonText: t("home.about"),
			icon: "assets/images/circle-information-svgrepo-com.svg?raw",
			iconAlt: "Icon",
			iconBClass: iconBClasses,
			href: "/about"
		}))
	)

	outer.append(inner);

	return outer;
}