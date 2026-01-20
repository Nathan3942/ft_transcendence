import createHeader from "../components/header/header";
import createFooter from "../components/footer/footer";

export default function assemblePage(element: HTMLDivElement) : HTMLDivElement {
    const template = document.createElement("template");
    template.innerHTML = `
        <div class="flex flex-col w-full h-full"></div> 
    `;

    const outFrame = template.content.firstElementChild as HTMLDivElement;
    if (!outFrame) {
        throw new Error("Failed to create page container");
    }
    outFrame.appendChild(createHeader());
    outFrame.appendChild(element);
    outFrame.appendChild(createFooter());
    return outFrame; 
}