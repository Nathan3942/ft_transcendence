import createHeader from "../components/header/header";
import createFooter from "../components/footer/footer";
import buildPopup from "../components/popup/popup";

export default function assemblePage(element: HTMLDivElement) : HTMLDivElement {
	const div = document.createElement("div");

	div.className = "flex flex-col w-full h-full";
	div.append(createHeader(), element, createFooter(), buildPopup());

	return div; 
}