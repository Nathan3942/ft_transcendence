import './style.css';
import { initRouter, Router } from './handler/routeHandler.js';
import { routes } from './routes/routes.js';
import { getItem, setItem } from './helpers/localStoragehelper.js';


const appElement = document.getElementById("app") as HTMLElement;
const router = new Router(appElement, routes);
initRouter(router);

if (getItem("loggedIn") === null)
	setItem<boolean>("loggedIn", false);

if (getItem("locale") === null)
	setItem<string>("locale", "en");

router.start();

document.addEventListener("localeChanged", (_) => {
	router.lazyLoad(window.location.pathname);
	console.log("Locale changed to", getItem("locale"));
})