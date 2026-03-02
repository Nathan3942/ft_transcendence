import './style.css';
import { Router } from './handler/routeHandler';
import { routes } from './routes/routes';


const appElement = document.getElementById("app") as HTMLElement;
const router = new Router(appElement, routes);

router.start();