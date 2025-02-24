import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'node:path'
import {svelteTesting} from '@testing-library/svelte/vite'

export default defineConfig({
  plugins: [
    svelte({ hot: !process.env.VITEST }),
    svelteTesting()
  ],
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ["./setupTests.js"],
    alias: {
      "$app/forms": resolve('./__mocks__/$app.forms.ts'),
      "$app/navigation": resolve('./__mocks__/$app.navigation.ts'),
      "$app/environment": resolve('./__mocks__/$app.environment.ts'),
      "$lib": resolve('./src/lib')
    }
  }
})