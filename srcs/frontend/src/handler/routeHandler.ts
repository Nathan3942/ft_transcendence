import create404page from '../routes/404page';
import createGameLocalPage from '../routes/game-local';
import createLocalAIGamePage from '../routes/game-local-ai';
import createGameOnlinePage from '../routes/game-online';
import createHomePage from '../routes/home';
import createLoginPage from '../routes/login-page';
import createTestPage from '../routes/test';
import assemblePage from './pageHandler';
import createLocalTournament from '../routes/local-tournament';
import createBrowseGamesPage from '../routes/browse-games';
import onlineMatch from '../routes/online-match';
import chooseOnlineMode from '../routes/online-mode';

type Route = {
    path: string;
    component: () => HTMLDivElement;
}

const routes: Route[] = [
    { path: "/", component: () => assemblePage(createHomePage()) },
    { path: "/leaderboard", component: () => assemblePage(document.createElement("div")) },
    { path: "/user-profile", component: () => assemblePage(document.createElement("div")) },
    { path: "/login", component: () => assemblePage(createLoginPage()) },
    { path: "/test", component: () => assemblePage(createTestPage()) },
    { path: "/game-local", component: () => assemblePage(createGameLocalPage()) },
    { path: "/game-local-ai", component: () => assemblePage(createLocalAIGamePage())},
    { path: "/game-online", component: () => assemblePage(createGameOnlinePage()) },
    { path: "/local-tournament", component: () => assemblePage(createLocalTournament()) },
    { path: "/browse-games", component: () => assemblePage(createBrowseGamesPage())},
    { path: "/online-mode", component: () => assemblePage(chooseOnlineMode())},
    { path: "/online-match", component: () => assemblePage(onlineMatch())}
];

export class Router {
    private routes: Route[] = routes;
    private rootElement: HTMLElement;

    constructor(rootElement: HTMLElement) {
        this.rootElement = rootElement;
        this.setupPopStateListener();
        this.setupEventListener();
        this.setupNavigateEvent();
    }

    public start(): void {
        const route = this.findRoute(window.location.pathname);
        if (route) {
            this.render(route);
        } else {
            this.rootElement.appendChild(assemblePage(create404page()))
        }
    }

    private setupNavigateEvent(): void {
        window.addEventListener("navigate", (e: Event) => {
            const path = (e as CustomEvent<{ path: string }>).detail?.path;
            if (path)
                this.navigateTo(path);
        })
    }

    public navigateTo(path: string): void {
        window.history.pushState({}, "", path);
        this.renderPath(path);
    }
    
    private findRoute(path: string): Route | undefined {
        return this.routes.find((route) => route.path === path);
    }

    private render(route: Route): void {
        this.rootElement.innerHTML = "";
        this.rootElement.appendChild(route.component());
    }

    private renderPath(path: string) {
        const route = this.findRoute(path);
        if (route) {
            this.render(route);
        } else {
            console.log("Error rendering route: ", path)
            this.rootElement.innerHTML = "";
            this.rootElement.appendChild(assemblePage(create404page()))
        }
    }

    private setupPopStateListener(): void {
        window.addEventListener("popstate", () => {
            this.renderPath(window.location.pathname);
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