import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		proxy: {
			'/location': 'https://mdv-test-h0019375.cs.wpi.edu/' 
		},
		watch: {
		  usePolling: true
		}
	},
	plugins: [sveltekit()]
});
