import './style.css';
import { initRouter, Router } from './handler/routeHandler';
import { routes } from './routes/routes';
import { getItem, setItem } from './helpers/localStoragehelper';

console.log("[LOAD] main.ts");

let globalWs: WebSocket | null = null;

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

export function connectGlobalWS() {
    if (globalWs && globalWs.readyState === WebSocket.OPEN)
      return;

    globalWs = new WebSocket(`wss://${window.location.host}/ws`);

    globalWs.onopen = () => {
      console.log("Global WS connected");
    };

    globalWs.onclose = () => {
      console.log("Global WS disconnected");

      // reconnect auto (optionnel)
      setTimeout(connectGlobalWS, 2000);
    };
}