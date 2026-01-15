/**
 * 파일명: auth-flow.spec.js
 * 작성자: Codex
 * 갱신일: 2026-01-15
 * 설명: 로그인 → 대시보드 → 로그아웃 E2E.
 */

const { test, expect } = require('@playwright/test')

test('login -> dashboard -> logout', async ({ page }) => {
  const username = process.env.E2E_USERNAME || 'demo@demo.demo'
  const password = process.env.E2E_PASSWORD || 'password123'

  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)

  await page.getByLabel('이메일').fill(username)
  await page.getByLabel('비밀번호').fill(password)
  await page.getByRole('button', { name: '로그인' }).click()

  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible()

  await page.getByRole('button', { name: '로그아웃' }).click()
  await expect(page).toHaveURL(/\/login/)
})

