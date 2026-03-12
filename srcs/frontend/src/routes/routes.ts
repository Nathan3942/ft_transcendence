import { authGuard} from "../handler/routeHandler";
import type { Route } from "../interfaces/properties";

const lazy = <T extends HTMLElement>(
	loader: () => Promise<{default: () => T | Promise<T>}>
) => async () => (await loader()).default();

const lazyInit = (
	loader: () => Promise<{default: () => void | Promise<void>}>
) => async () => (await loader()).default();

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
	}
]