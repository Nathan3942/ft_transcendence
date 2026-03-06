import { createButton } from "../components/button/button";

export default function initUSerSettings(): void {
	const submitPass = document.getElementById("submitPass")
	if (submitPass) {
		submitPass.replaceWith(createButton({
			id: "submitPass",
			type: "submit",
			extraClasses: "w-full py-2 px-4 bg-blue-500 dark:bg-blue-900 text-white rounded-md hover:bg-blue-600 hover:dark:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500",
			buttonText: "Update Password"
		}));
	}
}