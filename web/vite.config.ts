import { fileURLToPath, URL } from "node:url"

import { defineConfig, loadEnv, UserConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
	const env1 = loadEnv(mode, "./../", "")
	const env2 = loadEnv(mode, process.cwd(), "")

	return {
		plugins: [vue()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
		define: {
			__APP_ENV__: {
				...env1,
				...env2,
			},
		},
	}
})
