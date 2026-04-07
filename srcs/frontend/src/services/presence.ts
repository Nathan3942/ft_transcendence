import { API_BASE } from "../handler/loginHandler";
import { getItem } from "../helpers/localStoragehelper";

let ws: WebSocket | null = null;
let pingInterval: ReturnType<typeof setInterval> | null = null;
let recconnectTimeout: ReturnType<typeof setTimeout> | null = null;

export function startPresence(): void {
	if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING))
		return ;
	connect();
}

function connect(): void {
	ws = new WebSocket(`ws://${API_BASE}/ws`);

	ws.addEventListener("open", () => {
		clearTimeout(recconnectTimeout!);

		pingInterval = setInterval(() => {
			if (ws?.readyState === WebSocket.OPEN)
				ws.send(JSON.stringify({type: "ping"}));
		}, 30_000)
	});

	ws.addEventListener("message", (e) => {
		try {
			const msg = JSON.parse(e.data as string);
			if (msg.type === "status_update")
				handleStatusUpdate(msg.userId, msg.isOnline);
		} catch {}
	});

	ws.addEventListener("close", () => {
		clearInterval(pingInterval!);
		pingInterval = null;
		if (getItem<boolean>("loggedIn"))
			recconnectTimeout = setTimeout(connect, 5_000);
	});

	ws.addEventListener("error", () => ws?.close());
}

function handleStatusUpdate(userId: number, isOnline: boolean): void {
	const dot = document.getElementById(`presence-dot-${userId}`);
	if (dot)
		dot.className = isOnline
			? "w-2 h-2 rounded-full bg-green-500"
			: "w-2 h-2 rounded-full bg-gray-400";
}

export function stopPresence(): void {
	clearTimeout(recconnectTimeout!);
	clearInterval(pingInterval!);
	recconnectTimeout = null;
	pingInterval = null;
	ws?.close();
	ws = null;
}