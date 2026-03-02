import createFooter from "../components/footer/footer";
import createHeader from "../components/header/header";
import { modifyPopup, showPopup } from "../components/popup/popup";
import type { Route } from "../interfaces/properties";
import create404Page from "../routes/404page";
import createTestPage from "../routes/test";
import { authenticate } from "./loginHandler";
import assemblePage from "./pageHandler";


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

	public async navigateTo(path: string): Promise<void> {
		if (window.location.pathname !== path) {
			window.history.pushState({}, "", path);
			await this.handleLocation(path);
		}
	};

	private async handleLocation(path: string): Promise<void> {
		const route = this.routeMap.get(path) ?? this.routeMap.get("*");
		if (!route)
			return this.renderNotFound();

		if (route.guarded) {
			for (const g of route.guarded) {
				const res = await g();
				if (res === true)
					continue;
				else if (res === false)
					return this.redirectLogin();
				else if (res === "offline")
					return this.renderMessage("You appear to be offline. Some features may be unavailable");
				return this.renderMessage(res);
			}
		}

		try {
			const component = await route.component();
			this.replaceRoot(component);
		} catch (err) {
			console.error("Failed to load component for", path, err);
			this.renderError(`Component for: ${path} failed to load...`);
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

	private renderMessage(text: string): void {
		modifyPopup(text, "fixed bottom-4 left-4 max-w-sm p-4 bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-50");
		showPopup();
	};

	private renderError(err: string): void {
		modifyPopup(err, "fixed bottom-4 left-4 max-w-sm p-4 bg-red-100 text-red-800");
		showPopup();
	}

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
