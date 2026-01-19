import { type buttonProps } from "../../interfaces/properties.ts";

export function createButton(props: buttonProps): HTMLButtonElement {
	const template = document.createElement("template");
	template.innerHTML = `
		<button type="${props.type || ""}" class="${props.extraClasses || ""}">${props.buttonText}
		</button>
	`;

	const button = template.content.firstElementChild as HTMLButtonElement;
	if (props.f) {
		button.onclick = () => {
			props.f!();
		}
	}
	if (props.id)
		button.id = props.id;
	if (props.href) {
		button.onclick = () => window.location.href = props.href || "";
	}

	return button;
}