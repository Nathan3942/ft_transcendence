/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friendOverlay.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/?? ??:??:?? by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/19 00:00:00 by ChatGPT           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { API_BASE } from "../../handler/loginHandler";
import { getLocalId } from "../../helpers/apiHelper";
import { t } from "../../i18n/i18n";
import type {
	AddFriendRequest,
	Friend,
	FriendRequest,
	FriendRequestResponse,
	FriendResponse,
	PatchFriendRequest
} from "../../interfaces/properties";
import { createButton } from "../button/button";

let overlayInitialized = false;
let overlayLoading = false;

let friendRequestsCache: FriendRequestResponse | null = null;
let friendRequestsCacheAt = 0;
const FRIEND_REQUESTS_CACHE_MS = 5000;

export function buildFriendOverlay(): HTMLDivElement {
	overlayInitialized = false;
	const overlay = document.createElement("div");
	overlay.classList.add(
		"w-full",
		"h-[calc(100vh-60px-48px)]",
		"flex",
		"absolute",
		"left-0",
		"top-15",
		"viewport",
		"z-[100]",
		"hidden"
	);

	overlay.id = "headerFriendOverlay";

	const rightElement = document.createElement("div");
	rightElement.classList.add(
		"hidden",
		"md:flex",
		"md:w-3/5",
		"h-full",
		"bg-gray-100/20",
		"dark:bg-gray-900/30"
	);

	rightElement.innerHTML = `
		<button id="closeFriendOverlayButton" class="cursor-pointer"></button>
	`;

	const leftElement = document.createElement("div");
	leftElement.classList.add(
		"flex",
		"flex-col",
		"overflow-y-auto",
		"w-full",
		"md:w-2/5",
		"h-full",
		"bg-gray-300",
		"dark:bg-gray-700"
	);

	const inputClasses = [
		"mt-1 w-full px-3 py-2",
		"bg-gray-200 dark:bg-gray-800",
		"text-gray-900 dark:text-white text-base",
		"border-2 border-gray-400 dark:border-gray-500",
		"focus:outline-none focus:border-green-500 dark:focus:border-green-400",
		"placeholder-gray-400 dark:placeholder-gray-500",
		"rounded-none"
	].join(" ");

	const dividerClasses = [
		"mt-4 mx-6",
		"border-t-2 border-dashed border-gray-700 dark:border-gray-400"
	].join(" ");

	const listClasses = ["divide-y"].join(" ");

	leftElement.innerHTML = `
		<div class="flex md:hidden fixed right-0 pt-2 pr-2">
			<button
				id="closeFriendOverlayMobile"
				class="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-2xl leading-none px-2 py-1 cursor-pointer"
			>✕</button>
		</div>

		<section class="pt-4 m-4">
			<h1 class="text-2xl animate-blink">▐ ${t("nav.friends.add")}</h1>
			<form id="addFriendForm">
				<input
					id="addFriendInput"
					required
					type="number"
					placeholder="${t("nav.friends.idPlaceholder")}"
					class="${inputClasses}"
				/>
				<button id="addFriendButton"></button>
				<p id="addFriendMsg" class="pt-3 text-center"></p>
			</form>
		</section>

		<div class="${dividerClasses}"></div>

		<section class="pt-4 m-4">
			<h1 class="text-2xl">${t("nav.friends.online")}</h1>
			<ul id="onlineFriendList" class="${listClasses}"></ul>
		</section>

		<div class="${dividerClasses}"></div>

		<section class="pt-4 m-4">
			<h1 class="text-2xl">${t("nav.friends.offline")}</h1>
			<ul id="offlineFriendList" class="${listClasses}"></ul>
		</section>

		<div class="${dividerClasses}"></div>

		<section class="pt-4 m-4">
			<h1 class="text-2xl">${t("nav.friends.requests")}</h1>
			<ul id="incomingRequestsList" class="${listClasses}"></ul>
		</section>
	`;

	overlay.append(leftElement, rightElement);
	return overlay;
}

async function getFriendList(id: number): Promise<FriendResponse> {
	const resp = await fetch(`${API_BASE}/users/${id}/friends`, {
		method: "GET",
		credentials: "include",
	});

	if (resp.ok) {
		return await resp.json() as FriendResponse;
	}
	if (resp.status === 404) {
		throw new Error("404: The specified user does not seem to exist.");
	}
	throw new Error(`Unexpected error: ${resp.status}.`);
}

async function removeFriend(id: number): Promise<string> {
	const localId = getLocalId();

	if (!localId)
		return t("nav.friends.errorNoLocalId");

	const resp = await fetch(`${API_BASE}/users/${localId}/friends/${id}`, {
		method: "DELETE",
		credentials: "include"
	});

	if (resp.ok) {
		return "200";
	}
	if (resp.status === 403) {
		console.error("Error 403: User does not have the rights to terminate this friendship");
		return t("nav.friends.errorNoRights");
	}
	if (resp.status === 404) {
		console.error(`Error 404: You are not friends with ${id}`);
		return t("nav.friends.errorNotFriends") + id;
	}

	console.error(`Error: Unexpected error: ${resp.status}`);
	return t("nav.friends.errorUnexpected") + resp.status;
}

export async function getFriendRequests(
	id: number,
	force = false
): Promise<FriendRequestResponse> {
	const now = Date.now();

	if (!force && friendRequestsCache && now - friendRequestsCacheAt < FRIEND_REQUESTS_CACHE_MS) {
		return friendRequestsCache;
	}

	const resp = await fetch(`${API_BASE}/users/${id}/friends/requests`, {
		method: "GET",
		credentials: "include"
	});

	if (resp.ok) {
		const jsonResp = await resp.json() as FriendRequestResponse;
		friendRequestsCache = jsonResp;
		friendRequestsCacheAt = now;
		return jsonResp;
	}
	if (resp.status === 403) {
		throw new Error("Error: 403: You do not have permission to view this users friend requests");
	}
	if (resp.status === 404) {
		throw new Error("Error: 404: The requested user was not found");
	}

	const text = await resp.text().catch(() => "");
	throw new Error(`Error: unexpected error: ${resp.status}: ${text}`);
}

async function replyToFriendRequest(
	state: "accept" | "reject",
	uid: number,
	friendId: number
): Promise<string> {
	const form: PatchFriendRequest = {
		action: state
	};

	const resp = await fetch(`${API_BASE}/users/${uid}/friends/${friendId}`, {
		method: "PATCH",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(form)
	});

	if (resp.ok)
		return "200";
	if (resp.status === 400)
		return t("nav.friends.errorInvalidAction");
	if (resp.status === 403)
		return t("nav.friends.errorNoPermission");
	if (resp.status === 404)
		return t("nav.friends.errorUserNotFound");
	return t("nav.friends.errorUnexpected") + resp.status;
}

function invalidateFriendRequestsCache() {
	friendRequestsCache = null;
	friendRequestsCacheAt = 0;
}

function setupOverlayOnce() {
	if (overlayInitialized)
		return;

	const closeOverlay = document.getElementById("closeFriendOverlayButton") as HTMLButtonElement | null;
	const addFriendButton = document.getElementById("addFriendButton") as HTMLButtonElement | null;
	const addFriendForm = document.getElementById("addFriendForm") as HTMLFormElement | null;
	const mobileClose = document.getElementById("closeFriendOverlayMobile") as HTMLButtonElement | null;

	if (addFriendForm) {
		addFriendForm.addEventListener("submit", async (e) => {
			e.preventDefault();

			const friendInput = document.getElementById("addFriendInput") as HTMLInputElement | null;
			const statusMsg = document.getElementById("addFriendMsg") as HTMLParagraphElement | null;

			if (!friendInput || !statusMsg)
				return;

			const form: AddFriendRequest = {
				friendId: parseInt(friendInput.value, 10)
			};

			if (Number.isNaN(form.friendId)) {
				statusMsg.classList.remove("text-green-600");
				statusMsg.classList.add("text-red-500");
				statusMsg.innerText = t("nav.friends.errorUnexpected") + "invalid id";
				return;
			}

			const resp = await fetch(`${API_BASE}/users/${getLocalId()}/friends`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(form)
			});

			if (resp.ok) {
				statusMsg.classList.add("text-green-600");
				statusMsg.classList.remove("text-red-500");
				statusMsg.innerText = t("nav.friends.requestSent") + friendInput.value;
				friendInput.value = "";
				return;
			}

			statusMsg.classList.remove("text-green-600");
			statusMsg.classList.add("text-red-500");

			if (resp.status === 404) {
				console.error("Error 404: The user you are trying to friend cannot be found");
				statusMsg.innerText = t("nav.friends.notFound");
			} else if (resp.status === 409) {
				console.error("Error 409: You are already friends with this user");
				statusMsg.innerText = t("nav.friends.alreadyFriends");
			} else {
				console.error(`Error: ${resp.status}: ${resp.statusText}`);
				statusMsg.innerText = `${t("nav.friends.errorUnexpected")}${resp.status}: ${resp.statusText}`;
			}
		});
	}

	if (closeOverlay) {
		closeOverlay.replaceWith(createButton({
			id: "closeFriendOverlayButton",
			extraClasses: "w-full h-full",
			f: () => {
				document.getElementById("headerFriendOverlay")?.classList.add("hidden");
			}
		}));
	}

	if (mobileClose) {
		mobileClose.addEventListener("click", () => {
			document.getElementById("headerFriendOverlay")?.classList.add("hidden");
		});
	}

	if (addFriendButton) {
		const buttonClasses = [
			"w-full py-2 mt-2",
			"bg-blue-400 dark:bg-blue-800",
			"rounded-md",
			"hover:bg-blue-500 hover:dark:bg-blue-700",
			"active:brightness-95 dark:active:brightness-110",
			"transition-colors duration-100"
		].join(" ");

		addFriendButton.replaceWith(createButton({
			id: "addFriendButton",
			buttonText: t("nav.friends.add"),
			type: "submit",
			extraClasses: buttonClasses,
		}));
	}

	overlayInitialized = true;
}

// Mode 0 = open/close
// Mode 1 = refresh content only
export async function populateFriendOverlay(mode: number): Promise<void> {
	if (overlayLoading)
		return;

	overlayLoading = true;

	try {
		const overlay = document.getElementById("headerFriendOverlay") as HTMLDivElement | null;
		if (!overlay)
			return;

		if (mode === 0) {
			if (overlay.classList.contains("hidden")) {
				overlay.classList.remove("hidden");
			} else {
				overlay.classList.add("hidden");
				return;
			}
		}

		setupOverlayOnce();

		const liClasses = "flex items-center gap-3 py-2";

		try {
			const id = getLocalId();
			if (!id)
				throw new Error(t("nav.friends.errorNoLocalId"));

			const response = await getFriendList(id);
			const friendList = response.data;

			const onlineList = document.getElementById("onlineFriendList") as HTMLUListElement | null;
			const offlineList = document.getElementById("offlineFriendList") as HTMLUListElement | null;

			if (!onlineList || !offlineList)
				return;

			onlineList.innerHTML = "";
			offlineList.innerHTML = "";

			friendList.forEach((friend: Friend) => {
				const li = document.createElement("li");
				li.className = liClasses;

				li.innerHTML = `
					<span
						id="presence-dot-${friend.id}"
						class="absolute bottom-0 right-0 w-2 h-2 rounded-full ${friend.is_online ? "bg-green-500" : "bg-gray-400"}">
					</span>
					<div id="friend-info-${friend.id}" class="flex flex-col">
						<p class="font-sm">uid: ${friend.id}</p>
					</div>
					<p id="friendStatusBox-${friend.id}" class="text-xs text-red-500"></p>
				`;
	
				li.prepend(createButton({
					href: `/user-profile/${friend.id}`,
					icon: friend.avatar_url,
					iconAlt: friend.username,
					iconBClass: "w-10 h-10"
				}));

				const friendInfo = li.querySelector(`#friend-info-${friend.id}`)!;
				friendInfo.prepend(createButton({
					buttonText: `${friend.username}`,
					href: `/user-profile/${friend.id}`,
					id: `friend-button-${friend.id}`,
					extraClasses: "hover:opacity-80"
				}));

				li.appendChild(createButton({
					id: `removeFriendButton-${friend.id}`,
					f: async () => {
						const status = document.getElementById(`friendStatusBox-${friend.id}`) as HTMLParagraphElement | null;
						const resp = await removeFriend(friend.id);

						if (resp === "200") {
							li.remove();
							return;
						}
						if (status)
							status.innerText = resp;
					},
					extraClasses: "ml-auto mr-2",
					iconBClass: "h-7 w-7 brightness-130 dark:brightness-120 hover:brightness-70 dark:hover:brightness-80",
					icon: "/assets/images/xmark-red-svgrepo-com.svg?raw",
					iconAlt: t("nav.friends.removeFriend")
				}));

				if (friend.is_online)
					onlineList.appendChild(li);
				else
					offlineList.appendChild(li);
			});
		} catch (e) {
			console.error(e);
		}

		try {
			const id = getLocalId();
			if (!id)
				throw new Error(t("nav.friends.errorNoLocalId"));

			const response = await getFriendRequests(id, mode === 1);
			const requestList = response.data;

			const friendRequests = document.getElementById("incomingRequestsList") as HTMLUListElement | null;
			if (!friendRequests)
				return;

			friendRequests.innerHTML = "";

			const dot = document.getElementById("friend-request-dot");
			if (dot) {
				if (requestList.length > 0)
					dot.classList.remove("hidden");
				else
					dot.classList.add("hidden");
			}

			requestList.forEach((request: FriendRequest) => {
				const li = document.createElement("li");
				li.className = liClasses;

				li.innerHTML = `
					<div id="request-info-${request.requester_id}" class="flex flex-col">
						<p class="font-sm">uid: ${request.requester_id}</p>
					</div>
					<p id="requestStatusBox-${request.requester_id}" class="text-xs text-red-500"></p>
				`;

				li.prepend(createButton({
					href: `/user-profile/${request.requester_id}`,
					icon: request.avatar_url,
					iconAlt: request.username,
					iconBClass: "w-10 h-10"
				}));

				const requestInfo = li.querySelector(`#request-info-${request.requester_id}`)!;
				requestInfo.prepend(createButton({
					buttonText: `${request.username}`,
					href: `/user-profile/${request.requester_id}`,
					id: `friend-button-${request.requester_id}`,
					extraClasses: "hover:opacity-80"
				}));

				const buttons = document.createElement("div");
				buttons.className = "ml-auto flex flex-row justify-between";

				buttons.append(
					createButton({
						icon: "/assets/images/check-green-svgrepo-com.svg?raw",
						iconBClass: "w-7 h-7 mr-3",
						f: async () => {
							const resp = await replyToFriendRequest("accept", id, request.requester_id);

							if (resp === "200") {
								invalidateFriendRequestsCache();
								await populateFriendOverlay(1);
							} else {
								const statusBox = document.getElementById(`requestStatusBox-${request.requester_id}`);
								if (statusBox)
									statusBox.innerText = resp;
							}
						}
					}),
					createButton({
						icon: "/assets/images/xmark-red-svgrepo-com.svg?raw",
						iconBClass: "w-7 h-7",
						f: async () => {
							const resp = await replyToFriendRequest("reject", id, request.requester_id);

							if (resp === "200") {
								invalidateFriendRequestsCache();
								await populateFriendOverlay(1);
							} else {
								const statusBox = document.getElementById(`requestStatusBox-${request.requester_id}`);
								if (statusBox)
									statusBox.innerText = resp;
							}
						}
					})
				);

				li.appendChild(buttons);
				friendRequests.appendChild(li);
			});
		} catch (e) {
			console.error(e);
		}
	} finally {
		overlayLoading = false;
	}
}