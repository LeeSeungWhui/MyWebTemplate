/**
 * 파일명: playwright.config.js
 * 작성자: Codex
 * 갱신일: 2026-01-15
 * 설명: 로컬 Playwright E2E 설정(로그인→대시보드→로그아웃).
 */

const { defineConfig, devices } = require('@playwright/test')

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000'

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

