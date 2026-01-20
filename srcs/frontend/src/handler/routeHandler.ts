import create404page from '../routes/404page';
import createLoginPage from '../routes/login-page';
import createTestPage from '../routes/test';
import assemblePage from './pageHandler';

type Route = {
    path: string;
    component: () => HTMLDivElement;
}

const routes: Route[] = [
    { path: "/", component: () => "work in progres" as unknown as HTMLDivElement },
    { path: "/leaderboard", component: () => "work in progres" as unknown as HTMLDivElement },
    { path: "/user-profile", component: () => "work in progres" as unknown as HTMLDivElement },
    { path: "/login", component: () => assemblePage(createLoginPage()) },
    { path: "/test", component: () => assemblePage(createTestPage()) }
];

export class Router {
    private routes: Route[] = routes;
    private rootElement: HTMLElement;

    constructor(rootElement: HTMLElement) {
        this.rootElement = rootElement;
        this.setupPopStateListener();
    }

    public start(): void {
        this.navigateTo(window.location.pathname);
    }

    public navigateTo(path: string): void {
        const route = this.findRoute(path);
        if (route) {
            window.history.pushState({}, "", path);
            this.render(route);
        } else {
            this.rootElement.appendChild(assemblePage(create404page()))
        }
    }
    
    private findRoute(path: string): Route | undefined {
        return this.routes.find((route) => route.path === path);
    }

    private render(route: Route): void {
        this.rootElement.innerHTML = "";
        this.rootElement.appendChild(route.component());
    }

    private setupPopStateListener(): void {
        window.addEventListener("popstate", () => {
        this.navigateTo(window.location.pathname);
        });
    }
}