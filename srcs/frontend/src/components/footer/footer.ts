export default function createFooter(): HTMLHeadElement {
	const footer = document.createElement("footer");

	footer.className = "w-full flex align-bottom justify-center bg-gray-200 dark:bg-gray-800 p-3 dark:text-white footer z-[200]";
	footer.append("© hlibine & tmontani & njeanbou");

	return footer;
}