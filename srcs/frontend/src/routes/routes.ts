import { authGuard} from "../handler/routeHandler.js";
import type { Route } from "../interfaces/properties.js";

const lazy = <T extends HTMLElement>(
	loader: () => Promise<{default: (params?: Record<string, string>) => T | Promise<T>}>
	) => async (params?: Record<string, string>) => {
	const module = await loader();
	return module.default(params);
};

const lazyInit = (
	loader: () => Promise<{ default: (params?: Record<string, string>) => void | Promise<void> }>
	) => async (params?: Record<string, string>) => {
	const module = await loader();
	return module.default(params);
};


export const routes: Route[] = [
	{
		path: "/",
		component: lazy(() => import("./home")),
		guarded: [authGuard]
	},
	{
		path: "/leaderboard",
		component: lazy(() => import("./leaderboard")),
		// guarded: [authGuard]
	},
	{
		path: "/user-profile",
		component: lazy(() => import("./user-profile")),
		init: lazyInit(() => import("./user-profile-init")),
		guarded: [authGuard]
	},
	{
		path: "/user-settings",
		component: lazy(() => import("./user-settings")),
		init: lazyInit(() => import("./user-settings-init")),
		guarded: [authGuard]
	},
	{
		path: "/login",
		component: lazy(() => import("./login-page"))
	},
	{
		path: "/game-local",
		component: lazy(() => import("./game-local")),
		guarded: [authGuard]
	},
	{
		path: "/game-local-ai",
		component: lazy(() => import("./game-local-ai")),
		guarded: [authGuard]
	},
	{
		path: "/game-online",
		component: lazy(() => import("./game-online")),
		guarded: [authGuard]
	},
	{
		path: "/about",
		component: lazy(() => import("./about"))
	},
	{
		path: "/game-online",
		component: lazy(() => import("./game-online")),
		guarded: [authGuard]
	},
	{
		path: "/online-tournament",
		component: lazy(() => import("./online-tournament")),
		guarded: [authGuard]
	},
	{
		path: "/choose-browse",
		component: lazy(() => import("./choose-browse")),
		guarded: [authGuard]
	},
	{
		path: "/online-match",
		component: lazy(() => import("./online-match")),
		guarded: [authGuard]
	},
	{
		path: "/browse-games",
		component: lazy(() => import("./browse-games")),
		guarded: [authGuard]
	},
	{
		path: "/browse-tournaments",
		component: lazy(() => import("./browse-tournaments")),
		guarded: [authGuard]
	},
	{
		path: "/online-mode",
		component: lazy(() => import("./online-mode")),
		guarded: [authGuard]
	},
	{
		path: "/tournament-local",
		component: lazy(() => import("./tournament-local")),
		guarded: [authGuard]
	}
]