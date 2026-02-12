import create404page from '../routes/404page';
import createGameLocalPage from '../routes/game-local';
import createLocalAIGamePage from '../routes/game-local-ai';
import createGameOnlinePage from '../routes/game-online';
import createHomePage from '../routes/home';
import {buildLeaderboardPage} from '../routes/leaderboard';
import createLoginPage from '../routes/login-page';
import createTestPage from '../routes/test';
import assemblePage from './pageHandler';

type Route = {
    path: string;
    component: () => HTMLDivElement | Promise<HTMLDivElement>;
}

const routes: Route[] = [
    { path: "/", component: () => assemblePage(createHomePage()) },
    { path: "/leaderboard", component: async () => assemblePage(await buildLeaderboardPage()) },
    { path: "/user-profile", component: () => assemblePage(document.createElement("div")) },
    { path: "/login", component: () => assemblePage(createLoginPage()) },
    { path: "/test", component: () => assemblePage(createTestPage()) },
    { path: "/game-local", component: () => assemblePage(createGameLocalPage()) },
    { path: "/game-local-ai", component: () => assemblePage(createLocalAIGamePage())},
    { path: "/game-online", component: () => assemblePage(createGameOnlinePage()) }
];

export class Router {
    private routes: Route[] = routes;
    private rootElement: HTMLElement;

    constructor(rootElement: HTMLElement) {
        this.rootElement = rootElement;
        this.setupPopStateListener();
        this.setupEventListener();
    }

    public async start(): Promise<void> {
        this.renderPath(window.location.pathname);
    }

    public async navigateTo(path: string): Promise<void> {
        window.history.pushState({}, "", path);
        this.renderPath(path);
    }
    
    private findRoute(path: string): Route | undefined {
        return this.routes.find((route) => route.path === path);
    }

    private async render(route: Route): Promise<void> {
        try {
            this.rootElement.innerHTML = "";
            const component = await route.component();
            this.rootElement.appendChild(component);
        } catch (e) {
            console.error("Failed to render route:", e);
            this.rootElement.innerHTML = "";
            this.rootElement.appendChild(create404page());
        }
    }

    private async renderPath(path: string) {
        const route = this.findRoute(path);
        if (route) {
            await this.render(route);
        } else {
            console.log("Error rendering route: ", path)
            this.rootElement.innerHTML = "";
            this.rootElement.appendChild(assemblePage(create404page()))
        }
    }

    private setupPopStateListener(): void {
        window.addEventListener("popstate", async () => {
            await this.renderPath(window.location.pathname);
        });
        console.log("Popstate event triggered! Current path:", window.location.pathname);
    }

    private setupEventListener(): void {
        this.rootElement.addEventListener("click", (e) => {
            const target = (e.target as HTMLElement).closest("button[data-href]");
            if (target) {
                e.preventDefault();
                const path = target.getAttribute("data-href");
                if (path)
                    this.navigateTo(path);
            }
        })}
}