import { t } from "../../i18n/i18n";
import { createButton } from "./button.js";

export default function createBackButton(colors: string, bHref: string): HTMLDivElement {
	const div = document.createElement("div");
	div.className = [
		"flex flex-row absolute left-0 top-40",
		colors
	].join(" ");

	div.append(createButton({
		buttonText: t("common.back"),
		extraClasses: "flex justify-center w-full hover:pl-10 px-3 py-1 text-lg transition-scale duration-200",
		href: bHref,
		icon: "assets/images/flip-backward-svgrepo-com.svg",
		iconAlt: "Icon",
		iconBClass: "h-7 pr-1 dark:invert"
	}));


	return div;
}