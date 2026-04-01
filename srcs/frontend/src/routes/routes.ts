import { authGuard} from "../handler/routeHandler.js";
import type { Route } from "../interfaces/properties.js";

const lazy = <T extends HTMLElement>(
	loader: () => Promise<{default: () => T | Promise<T>}>
) => async () => (await loader()).default();

const lazyInit = (
	loader: () => Promise<{default: () => void | Promise<void>}>
) => async () => (await loader()).default();

export const routes: Route[] = [
	{
		path: "/",
		component: lazy(() => import("./home.js")),
		guarded: [authGuard]
	},
	{
		path: "/leaderboard",
		component: lazy(() => import("./leaderboard.js")),
		// guarded: [authGuard]
	},
	{
		path: "/user-profile",
		component: lazy(() => import("./user-profile.js")),
		init: lazyInit(() => import("./user-profile-init.js")),
		guarded: [authGuard]
	},
	{
		path: "/user-settings",
		component: lazy(() => import("./user-settings.js")),
		init: lazyInit(() => import("./user-settings-init.js")),
		guarded: [authGuard]
	},
	{
		path: "/login",
		component: lazy(() => import("./login-page.js"))
	},
	{
		path: "/game-local",
		component: lazy(() => import("./game-local.js")),
		guarded: [authGuard]
	},
	{
		path: "/game-local-ai",
		component: lazy(() => import("./game-local-ai.js")),
		guarded: [authGuard]
	},
	{
		path: "/game-online",
		component: lazy(() => import("./game-online.js")),
		guarded: [authGuard]
	},
	{
		path: "/about",
		component: lazy(() => import("./about.js"))
	}
]