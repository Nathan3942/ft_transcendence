export default function buildFriendOverlay(): HTMLDivElement {
	const overlay = document.createElement("div");
	overlay.classList.add("w-full", "h-full", "flex");

	const rightElement = document.createElement("div");
	rightElement.classList.add("w-3/5", "h-full", "bg-gray-100", "dark:bg-gray-900", "bg-opacity-20")

	const leftElement = document.createElement("div");
	leftElement.classList.add("flex", "flex-col", "w-2/5", "h-full", "bg-gray-300", "dark:bg-gray-700", "bg-opacity-75");
	
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

	leftElement.innerHTML = `

		<section class="pt-4 m-4">
			<!-- add friend box -->
			<h1 class="text-2xl">Add Friend</h1>
			<form id="addFriendForm">
				<input id="addFriendInput" required placeholder="Friend Id" class="${inputClasses}">
				</input>

				<button id="addFriendButton"></button>
			</form>
		</section>
			<div class="${dividerClasses}"></div>
		<section class="pt-4 m-4">
			<h1 class="text-2xl">Online Friends</h1>
			<ul id="onlineFriendList">

			</ul>
		</section>
			<div class="${dividerClasses}"></div>
		<section class="pt-4 m-4">
			<h1 class="text-2xl">Offline Friends</h1>
			<ul id="offlineFriendList">

			</ul>
		</section>
	
	`
	
	overlay.append(leftElement, rightElement);
	return overlay;
}