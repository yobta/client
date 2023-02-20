/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      skipFull: true,
    },
    globals: true,
    environment: 'happy-dom',
    restoreMocks: true,
  },
})
