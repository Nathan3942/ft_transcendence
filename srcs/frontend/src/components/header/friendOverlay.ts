import { API_BASE } from "../../handler/loginHandler.js";
import { getLocalId } from "../../helpers/apiHelper.js";
import type { AddFriendRequest, Friend, FriendRequest, FriendRequestResponse, FriendResponse, PatchFriendRequest } from "../../interfaces/properties.js";
import { createButton } from "../button/button.js";
import { renderMessage } from "../popup/popup.js";

export function buildFriendOverlay(): HTMLDivElement {
	const overlay = document.createElement("div");
	overlay.classList.add("w-full", "h-[calc(100vh-60px-48px)]",
		"flex", "absolute", "left-0", "top-15", "viewport", "z-[100]",
		"hidden");

	overlay.id = "headerFriendOverlay";

	const rightElement = document.createElement("div");
	rightElement.classList.add("w-3/5", "h-full",
		"bg-gray-100/20", "dark:bg-gray-900/30");
		
	rightElement.innerHTML = `
		<button id="closeFriendOverlayButton"></button>
	`;

	const leftElement = document.createElement("div");
	leftElement.classList.add("flex", "flex-col",
		"overflow-y-auto", "w-2/5", "h-full",
		"bg-gray-300", "dark:bg-gray-700");
	
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

	const listClasses = [
		"divide-y"
	].join(" ")

	leftElement.innerHTML = `

		<section class="pt-4 m-4">
			<h1 class="text-2xl animate-blink">▐ Add Friend</h1>
			<form id="addFriendForm">
				<input id="addFriendInput" required type="number" placeholder="Friend Id" class="${inputClasses}">
				</input>

				<button id="addFriendButton"></button>
				<p id="addFriendMsg" class="pt-3 text-center"></p>
			</form>
		</section>
			<div class="${dividerClasses}"></div>
		<section class="pt-4 m-4">
			<h1 class="text-2xl">Online Friends</h1>
			<ul id="onlineFriendList" class="${listClasses}">

			</ul>
		</section>
			<div class="${dividerClasses}"></div>
		<section class="pt-4 m-4">
			<h1 class="text-2xl">Offline Friends</h1>
			<ul id="offlineFriendList" class="${listClasses}">

			</ul>
		</section>
			<div class="${dividerClasses}"></div>
		<section class="pt-4 m-4">
			<h1 class="text-2xl">Friend Requests</h1>
			<ul id="incomingRequestsList" class="${listClasses}">

			</ul
		</section>
	
	`
	
	overlay.append(leftElement, rightElement);
	return overlay;
}

async function getFriendList(id: number): Promise<FriendResponse> {
	const resp = await fetch(`${API_BASE}/users/${id}/friends`, {
		method: "GET",
		credentials: "include",
	});

	if (resp.ok) {
		const respJson = await resp.json() as FriendResponse
		return respJson;
	} else if (resp.status === 404 && resp.text.length == 0) {
		renderMessage("You appear to be offline, please try again later.");
		throw new Error(`You appear to be offline, please try again later.`);
	} else if (resp.status === 404) {
		throw new Error(`404: The specified user does not seem to exist.`);
	} else {
		throw new Error(`Unexpected error: ${resp.status}.`);
	}
}

async function removeFriend(id: number): Promise<string> {
	// Show confirmation popup

	const resp = await fetch(`${API_BASE}/${getLocalId}/friends/${id}`, {
		method: "DELETE",
		credentials: "include"
	})

	if (resp.ok) {
		return `200`;
	} else if (resp.status === 403) {
		console.error("Error 403: User does not have the rights to terminate this friendship");
		return "Error: User does not have the rights to terminate this friendship";
	} else if (resp.status === 404 && resp.text.length === 0) {
		console.error("Error 404: You appear to be offline, please try again later");
		renderMessage("You appear to be offline, please try again later.");
		return "You appear to be offline, please try again later.";
	} else if (resp.status === 404) {
		console.error(`Error 404: You are not friends with ${id}`);
		return `Error, you are not friends with ${id}`;
	} else {
		console.error(`Error: Unexpected error: ${resp.status}`);
		return `Error: Unexpected error: ${resp.status}`;
	}
}

async function getFriendRequests(id: number): Promise<FriendRequestResponse> {
	
	const resp = await fetch(`${API_BASE}/users/${id}/friends/requests`, {
		method: "GET",
		credentials: "include"
	});

	if (resp.ok) {
		const jsonResp = await resp.json() as FriendRequestResponse;
		return jsonResp;
	} else if (resp.status === 403) {
		throw new Error("Error: 403: You do not have permission to view this users friend requests");
	} else if (resp.status === 404 && resp.text.length === 0) {
		throw new Error("You appear to be offline, please try again later.");
	} else if (resp.status === 404) {
		throw new Error("Error: 404: The requested user was not found");
	} else {
		throw new Error(`Error: unexpected error: ${resp.status}: ${resp.text}`);
	}
}

async function replyToFriendRequest(state: "accept" | "reject", uid: number, friendId: number): Promise<string> {

	const form: PatchFriendRequest = {
		action: state
	}

	const resp = await fetch(`${API_BASE}/users/${uid}/friends/${friendId}`, {
		method: "PATCH",
		credentials: "include",
		body: JSON.stringify(form)
	});

	if (resp.ok)
		return "200";
	else if (resp.status === 400) {
		return "Error: 400: Invalid action performed";
	} else if (resp.status === 403) {
		return "Error: 403: You do not have permission to view this users friend requests";
	} else if (resp.status === 404 && resp.text.length === 0) {
		return "You appear to be offline, please try again later.";
	} else if (resp.status === 404) {
		return "Error: 404: The requested user was not found";
	} else {
		return `Error: unexpected error: ${resp.status}: ${resp.text}`;
	}
}

// Mode 0 = default
// Mode 1 = refresh
export async function populateFriendOverlay(mode: number): Promise<void> {
	const overlay = document.getElementById("headerFriendOverlay") as HTMLDivElement;
	const closeOverlay = document.getElementById("closeFriendOverlayButton") as HTMLButtonElement;
	const addFriendButton = document.getElementById("addFriendButton") as HTMLButtonElement;
	const addFriendForm = document.getElementById("addFriendForm") as HTMLFormElement;

	if (mode == 0) {
		if (overlay!.classList.contains("hidden"))
			overlay!.classList.remove("hidden");
		else {
			overlay!.classList.add("hidden");
			return ;
		}
	}

	if (addFriendForm) {
		addFriendForm.addEventListener("submit", async (e) => {
			const friendInput = document.getElementById("addFriendInput")! as HTMLInputElement;
			const statusMsg = document.getElementById("addFriendMsg")! as HTMLParagraphElement;
			
			e.preventDefault()

			const form: AddFriendRequest = {
				friendId: parseInt(friendInput.value)
			}

			const resp = await fetch(`${API_BASE}/${getLocalId}/friends`, {
				method: "POST",
				credentials: "include",
				body: JSON.stringify(form)
			})

			if (resp.ok) {
				if (!statusMsg.classList.contains("text-green-600"))
					statusMsg.classList.add("text-green-600");
				if (statusMsg.classList.contains("text-red-500"))
					statusMsg.classList.remove("text-red-500");
				statusMsg.innerText = `Successfully sent a friend request to ${friendInput.value}`
			} else {
				if (statusMsg.classList.contains("text-green-600"))
					statusMsg.classList.remove("text-green-600");
				if (!statusMsg.classList.contains("text-red-500"))
					statusMsg.classList.add("text-red-500");

				if (resp.status === 404 && resp.text.length === 0) {
					console.error("Error 404: You appear to be offline, please try again later");
					statusMsg.innerText = `You appear to be offline, please try again later`;
					renderMessage("You appear to be offline, please try again later.");
				} else {
					console.error(`Error: ${resp.status}: ${resp.text}`);
					statusMsg.innerText = `Error: ${resp.status}: ${resp.text}`;
				}
			}
		})
	}

	closeOverlay!.replaceWith(createButton({
		id: "closeFriendOverlayButton",
		extraClasses: "w-full h-full",
		f: () => {
			document.getElementById("headerFriendOverlay")!.classList.add("hidden");
		}
	}));

	const buttonClasses = [
		"w-full py-2 mt-2",
		"bg-blue-400 dark:bg-blue-800",
		"rounded-md",
		"hover:bg-blue-500 hover:dark:bg-blue-700",
		"active:brightness-95 dark:active:brightness-110",
		"transition-colors duration-100"
	].join(" ")

	addFriendButton!.replaceWith(createButton({
		id: "addFriendButton",
		buttonText: "Add Friend",
		type: "submit",
		extraClasses: buttonClasses,
	}))
	
	const liClasses = `flex items-center gap-3 py-2`

	try {
		const id = getLocalId()
		if (!id)
			throw new Error("Could not find local user ID, please refresh the page and try again")

		const response = await getFriendList(id);
		const friendList = response.data;

		const onlineList = document.getElementById("onlineFriendList") as HTMLUListElement
		onlineList.innerHTML = "";
		const offlineList = document.getElementById("offlineFriendList") as HTMLUListElement
		offlineList.innerHTML = "";

		friendList.forEach((friend: Friend) => {
			const li = document.createElement("li");
			li.classList = liClasses;

			li.innerHTML = `
				<img src="${friend.avatar_url}" alt=${friend.display_name} class="w-10 h-10" />
				<div class="flex flex-col">
					<p class="font-medium">${friend.display_name}</p>
					<p class="font-sm>">@${friend.username}</p>
				</div>
				<p id="friendStatusBox-${friend.id}" class="text-xs text-red-500"><p>
			`
			li.appendChild(createButton({
					id: "removeFriendButton",
					f: async () => {
						const status = document.getElementById(`friendStatusBox-${friend.id}`) as HTMLParagraphElement;
						const resp = await removeFriend(friend.id);
						if (resp === "200") {
							li.remove();
							return ;
						}
						status.innerText = resp;
					},
					extraClasses: "ml-auto mr-2",
					iconBClass:"h-7 w-7 brightness-130 dark:brightness-120 hover:brightness-70 dark:hover:brightness-80",
					icon: "/assets/images/xmark-red-svgrepo-com.svg?raw",
					iconAlt: "Remove friend"
				}));

			if (friend.is_online) {
				onlineList.appendChild(li);
			} else {
				offlineList.appendChild(li);
			}
		})
		
	} catch (e) {
		console.log(`${e}`);
	}

	try {
		const id = getLocalId();
		if (!id)
			throw new Error("Could not find local user ID, please refresh the page and try again");

		const response = await getFriendRequests(id);
		const requestList = response.data;

		const friendRequests = document.getElementById("incomingRequestsList") as HTMLUListElement;
		friendRequests.innerHTML = "";

		requestList.forEach((request: FriendRequest) => {
			const li = document.createElement("li");
			li.className = liClasses;
			
			li.innerHTML = `
			<img src="${request.avatar_url}" alt=${request.display_name} class="w-10 h-10" />
			<div class="flex flex-col">
			<p class="font-medium">${request.display_name}</p>
			<p class="font-sm>">@${request.username}</p>
			</div>
			<p id="requestStatusBox-${request.requester_id}" class="text-xs text-red-500"><p>
			`;
			
			const buttons = document.createElement("div");
			buttons.className = "ml-auto flex flex-row justify-between";

			buttons.append(
				createButton({
					icon: "/assets/images/check-green-svgrepo-com.svg?raw",
					iconBClass: "w-7 h-7 mr-3",
					f: async () => {
						const resp = await replyToFriendRequest("accept", id, request.requester_id)
						if (resp === "200") {
							populateFriendOverlay(1);
						} else {
							document.getElementById(`requestStatusBox-${request.requester_id}`)!.innerText = resp;
						}
					}
			}),
				createButton({
					icon: "/assets/images/xmark-red-svgrepo-com.svg?raw",
					iconBClass: "w-7 h-7",
					f: async () => {
						const resp = await replyToFriendRequest("reject", id, request.requester_id)
						if (resp === "200") {
							populateFriendOverlay(1);
						} else {
							document.getElementById(`requestStatusBox-${request.requester_id}`)!.innerText = resp;
						}
					}
			}));

			li.appendChild(buttons);
			friendRequests.appendChild(li);
		});

 
	} catch (e) {
		console.error(e);
	}

}