import create404page from '../routes/404page'

type Route = {
    path: string;
    component: () => void;
}

const routes: Route[] = [
    { path: "/", component: () => console.log("Home Page") },
    { path: "/leaderboard", component: () => console.log("Leaderboard page") },
    { path: "/user-profile", component: () => console.log("User Profile page") },
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
            this.rootElement.appendChild(create404page());
        }
    }
    
    private findRoute(path: string): Route | undefined {
        return this.routes.find((route) => route.path === path);
    }

    private render(route: Route): void {
        this.rootElement.innerHTML = "";
        route.component();
    }

    private setupPopStateListener(): void {
        window.addEventListener("popstate", () => {
        this.navigateTo(window.location.pathname);
        });
    }
}