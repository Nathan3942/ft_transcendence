import { API_BASE } from "../handler/loginHandler";
import { getLocalId } from "../helpers/apiHelper";

let ws: WebSocket | null = null;

export function startPresence(): void {
	if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING))
		return ;
	connect();
}

function connect(): void {
	ws = new WebSocket(`wss://${window.location.host}${API_BASE}/ws`);

	ws.send(JSON.stringify({type: "ping", id: getLocalId()}));

	ws.addEventListener("error", () => ws?.close());
}

export function stopPresence(): void {
	ws?.close();
	ws = null;
}