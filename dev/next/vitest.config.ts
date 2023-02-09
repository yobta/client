import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
    globals: false,
    environment: 'happy-dom',
    setupFiles: ['dotenv/config'],
  },
})
