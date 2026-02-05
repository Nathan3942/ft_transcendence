import createHeader from "../components/header/header";
import createFooter from "../components/footer/footer";

export default function assemblePage(element: HTMLDivElement) : HTMLDivElement {
    const template = document.createElement("template");
    template.innerHTML = `
        <div class="flex flex-col w-full h-full">
            <header>
            </header>
            <div id="viewport">
            </div>
            <footer>
            </footer>
        </div> 
    `;

    const headerContainer = template.content.querySelector("header");
    headerContainer?.replaceWith(createHeader());

    const viewportContainer = template.content.querySelector("#viewport");
    viewportContainer?.replaceWith(element);

    const footerContainer = template.content.querySelector("footer");
    footerContainer?.replaceWith(createFooter());

    return template.content.firstElementChild as HTMLDivElement; 
}