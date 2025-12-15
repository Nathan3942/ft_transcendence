import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig ({
	root: "public",
	base: "/",
	plugins: [
		tailwindcss(),
	],
})