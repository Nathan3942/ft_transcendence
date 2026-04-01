import './style.css';
import { initRouter, Router } from './handler/routeHandler';
import { routes } from './routes/routes';
import { getItem, setItem } from './helpers/localStoragehelper';


const appElement = document.getElementById("app") as HTMLElement;
const router = new Router(appElement, routes);
initRouter(router);

if (getItem("loggedIn") === null)
	setItem<boolean>("loggedIn", false);

router.start();