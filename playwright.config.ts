import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './generated',
  reporter: 'list',
  use: { baseURL: process.env.TARGET_URL ?? 'http://127.0.0.1:4400' },
})
