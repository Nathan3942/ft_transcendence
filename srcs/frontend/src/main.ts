import './style.css';
import { Router } from './handler/routeHandler';
import { routes } from './routes/routes';
import { getItem, setItem } from './helpers/localStoragehelper';


const appElement = document.getElementById("app") as HTMLElement;
const router = new Router(appElement, routes);

if (getItem("loggedIn") === null)
	setItem<boolean>("loggedIn", false);

router.start();