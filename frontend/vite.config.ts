import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
	server: {
		https: {
			key: 'cert/ca-key.pem',
			cert: 'cert/ca-cert.pem'
		},
		watch: {
		  usePolling: true
		}
	},
	plugins: [sveltekit()]
});
