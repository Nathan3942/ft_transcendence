import { renderError } from "../components/popup/popup.js";
import type { Route, RouteParams } from "../interfaces/properties.js";
import create404Page from "../routes/404page.js";
import createTestPage from "../routes/test.js";
import { authenticate } from "./loginHandler.js";
import assemblePage from "./pageHandler.js";

// Router singleton

let _router: Router | null = null;

export function initRouter(router : Router): void {
	if (_router)
		throw new Error("Router already initalized");
	_router = router;
}

export function getRouter(): Router {
	if (!_router)
		throw new Error("Router not initialized");
	return _router;
}

// Router Proper
export type ComponentFactory<T extends HTMLElement = HTMLElement> = () => T | Promise<T>;

type GuardTypes = true | false | "offline" | "string" | string;
export type Guard = () => Promise<GuardTypes>;

export const authGuard: Guard = async () => {
	const result = await authenticate();

	return result;
}

export class Router {
	private readonly routeMap: Map<String, Route>;
	private readonly root: HTMLElement;

	constructor(root: HTMLElement, routes: Route[]) {
		this.root = root;
		this.routeMap = new Map(routes.map(r => [r.path, r]));
		this.setupListeners();
	};

	public async start(): Promise<void> {
		this.root.replaceChildren(assemblePage(createTestPage()));
		await this.handleLocation(window.location.pathname);
	};

	public async lazyLoad(path: string): Promise<void> {
		await this.handleLocation(path);
	}

	public async navigateTo(path: string): Promise<void> {
		if (window.location.pathname !== path) {
			window.history.pushState({}, "", path);
			await this.handleLocation(path);
		}
	};

	private findMatchingRoutes(path: string): { route: Route, params: RouteParams} | null {
		const urlSegments = path.split("/").filter(s => s.length > 0);

		for (const [storedPath, route] of this.routeMap.entries()) {
			const routeSegments = storedPath.split("/").filter(s => s.length > 0);
			const params: Record<string, string> = {};
			let isMatch = true;

			if (urlSegments.length !== routeSegments.length)
				continue;

			for (let i = 0; i < routeSegments.length; ++i) {
				const routePart = routeSegments[i];
				const urlPart = urlSegments[i];

				if (routePart.startsWith(":")) {
					const paramName = routePart.slice(1);
					params[paramName] = urlPart;
				} else if (routePart !== urlPart) {
					isMatch = false;
					break;
				}
			}
			if (isMatch)
				return {route, params};
		}
		return null;
	}

	private async handleLocation(path: string): Promise<void> {
		const match = this.findMatchingRoutes(path);
		if (!match)
			return this.renderNotFound();

		const {route, params} = match;

		if (route.guarded) {
			for (const g of route.guarded) {
				const res = await g();
				if (res === true)
					continue;
				else if (res === false)
					return this.redirectLogin();
				else
					return ;
			}
		}

		try {
			const component = await route.component(params);
			this.replaceRoot(component);
			if (route.init)
				route.init(params)
		} catch (err) {
			console.error("Failed to load component for", path, err);
			renderError(`Component for: ${path} failed to load...`);
		}
	};

	private replaceRoot(node: HTMLDivElement): void {
		this.root.replaceChildren(assemblePage(node));
	};

	private renderNotFound(): void {
		this.replaceRoot(create404Page());
	};

	private redirectLogin(): void {
		window.location.href = "/login";
	};

	private setupListeners(): void {
		window.addEventListener("popstate", () => this.handleLocation(window.location.pathname))

		this.root.addEventListener("click", (e) => {
			const target = (e.target as HTMLElement).closest("[data-href]");
			if (!target)
				return;
			e.preventDefault();
			const href = target.getAttribute("data-href");
			if (href)
				this.navigateTo(href);
		})
	}
}
