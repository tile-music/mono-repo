import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		watch: {
		  usePolling: true
		}
	},
	plugins: [sveltekit()]
});
