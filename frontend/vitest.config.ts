import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    svelte({ hot: !process.env.VITEST }),
  ],
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ["./setupTests.js"],
    alias: {
      "$app/forms": resolve('./__mocks__/$app.forms.ts'),
    }
  }
})