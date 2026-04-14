import createBackButton from "../components/button/backButton";
import { t } from "../i18n/i18n";

export default function buildAboutPage(): HTMLDivElement {
	const outer = document.createElement("div");
	outer.className = "flex flex-1 justify-center overflow-y-auto";

	const userCard = [
		"team-card",
		"relative md:w-11/12 md:hover:w-full",
		"mx-4 md:mx-0",
		"transition-all duration-200",
		"hover:shadow-lg",
		"group"
	].join(" ");

	const userTitle = "text-xs uppercase tracking-widest opacity-60";
	
	const techStackBlocks = [
		"px-2 py-1",
		"bg-gray-200 dark:bg-gray-800",
		"border border-gray-400 dark:border-gray-600"
	].join(" ");

	outer.innerHTML = `
		<div class="w-full md:w-9/12 flex flex-col gap-8">
			<div class="flex items-center gap-4 mt-8">
				<h1 class="text-4xl font-bold animate-blink">▐ ${t("about.title")}</h1>
			</div>
			<div class="scanlines relative md:w-11/12 mx-4 md:mx-0 bg-gray-700 dark:bg-gray-800 border border-gray-600 dark:border-gray-700 p-6 text-white">
				<p class="text-xs uppercase tracking-widest text-gray-400 mb-3">&gt; ./about --project</p>
				<p class="text-sm leading-relaxed text-gray-200">
					${t("about.projectDescription")}
				</p>
			</div>

			<p class="text-xs uppercase tracking-widest opacity-50 w-11/12">&gt; ./about --team</p>

			<div class="${userCard}">
				<div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 dark:bg-blue-500"></div>
					<div class="bg-blue-300 dark:bg-blue-900 hover:brightness-90 dark:hover:brightness-125 flex flex-row p-5 pl-5 gap-4 items-start">
						<img src="assets/images/monitor-svgrepo-com.svg?raw" alt="Icon" class="h-10 w-10 dark:invert shrink-0 mt-0.5">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<p class="${userTitle}">${t("about.frontendRole")}</p>
								<p class="text-xs opacity-40 font-bold">P1</p>
							</div>
						<p class="text-xl font-bold mb-2">hlibine</p>
						<p class="text-sm leading-relaxed opacity-80">
							${t("about.frontendBio")}
						</p>
					</div>
				</div>
			</div>

			<div class="${userCard}">
				<div class="absolute left-0 top-0 bottom-0 w-1 bg-green-400 dark:bg-green-500"></div>
					<div class="bg-green-300 dark:bg-green-900 hover:brightness-90 dark:hover:brightness-125 flex flex-row p-5 pl-5 gap-4 items-start">
						<img src="assets/images/globe-svgrepo-com.svg?raw" alt="Icon" class="h-10 w-10 dark:invert shrink-0 mt-0.5">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<p class="${userTitle}">${t("about.backendRole")}</p>
								<p class="text-xs opacity-40 font-bold">P2</p>
							</div>
						<p class="text-xl font-bold mb-2">tmontani</p>
						<p class="text-sm leading-relaxed opacity-80">
							${t("about.backendBio")}
						</p>
					</div>
				</div>
			</div>

			<div class="${userCard}">
				<div class="absolute left-0 top-0 bottom-0 w-1 bg-red-400 dark:bg-red-500"></div>
					<div class="bg-red-300 dark:bg-red-900 hover:brightness-90 dark:hover:brightness-125 flex flex-row p-5 pl-5 gap-4 items-start">
						<img src="assets/images/arcade-game-pong-gaming-svgrepo-com.svg?raw" alt="Icon" class="h-10 w-10 dark:invert shrink-0 mt-0.5">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<p class="${userTitle}">${t("about.gameRole")}</p>
								<p class="text-xs opacity-40 font-bold">🏓</p>
							</div>
						<p class="text-xl font-bold mb-2">njeanbou</p>
						<p class="text-sm leading-relaxed opacity-80">
							${t("about.gameBio")}
						</p>
					</div>
				</div>
			</div>
			<div class="md:w-11/12 mx-4 md:mx-0 border border-dashed border-gray-400 dark:border-gray-600 p-5">
				<p class="text-xs uppercase tracking-widest opacity-50 mb-4">&gt; ./about --stack</p>
				<div class="flex flex-wrap gap-2 text-xs">
					<span class="${techStackBlocks}">TypeScript</span>
					<span class="${techStackBlocks}">Tailwind CSS</span>
					<span class="${techStackBlocks}">Fastify</span>
					<span class="${techStackBlocks}">Node.js</span>
					<span class="${techStackBlocks}">SQLite</span>
					<span class="${techStackBlocks}">Docker</span>
					<span class="${techStackBlocks}">WebSockets</span>
					<span class="${techStackBlocks}">JWT</span>
				</div>
			</div>
		</div>
	`

	outer.append(createBackButton("bg-purple-300 dark:bg-purple-900", "/"));

	return outer;
}