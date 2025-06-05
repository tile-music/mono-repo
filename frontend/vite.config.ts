import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        proxy: {
            "/location": "https://mdv-test-h0019375.cs.wpi.edu/",
            "/assets": {
                target: 'http://kong:8000/storage/v1/object',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/assets/, ""),
            }
        },
        watch: {
            usePolling: true,
        },
    },
    plugins: [sveltekit()],
});
