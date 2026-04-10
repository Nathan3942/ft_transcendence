import './style.css';
import { initRouter, Router } from './handler/routeHandler.js';
import { routes } from './routes/routes.js';
import { getItem, setItem } from './helpers/localStoragehelper.js';

let globalWs: WebSocket | null = null;

const appElement = document.getElementById("app") as HTMLElement;
const router = new Router(appElement, routes);
initRouter(router);

if (getItem("loggedIn") === null)
	setItem<boolean>("loggedIn", false);

router.start();

export function connectGlobalWS() {
    if (globalWs && globalWs.readyState === WebSocket.OPEN)
      return;

    globalWs = new WebSocket(`ws://${window.location.hostname}:3000/ws`);

    globalWs.onopen = () => {
      console.log("Global WS connected");
    };

    globalWs.onclose = () => {
      console.log("Global WS disconnected");

      // reconnect auto (optionnel)
      setTimeout(connectGlobalWS, 2000);
    };
}