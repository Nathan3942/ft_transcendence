import { type buttonProps } from "../../interfaces/properties.ts";

export function createButton(props: buttonProps): HTMLButtonElement {
	const btn = document.createElement("button");

	btn.type = props.type ?? "button";
	btn.id = props.id ?? "";
	btn.className = props.extraClasses ?? "";

	if (props.icon) {
		const img = document.createElement("img");
		img.src = props.icon;
		img.alt = props.iconAlt ?? "";
		img.className = props.iconBClass ?? "";
		btn.append(img);
	}

	btn.append(document.createTextNode(props.buttonText ?? ""));

	if (props.f) {
		btn.addEventListener("click", props.f);
	} else if (props.href) {
		btn.setAttribute("data-href", props.href)
	}

	return btn;
}