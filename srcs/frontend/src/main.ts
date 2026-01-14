import './style.css';
import { Router } from './handler/routeHandler';


const appElement = document.getElementById("app") as HTMLElement;
const router = new Router(appElement);

router.start();