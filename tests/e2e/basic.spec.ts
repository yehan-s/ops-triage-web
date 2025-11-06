import { test, expect } from '@playwright/test'

test.describe('基础功能测试', () => {
  test('应该能访问首页', async ({ page }) => {
    await page.goto('/')

    // 检查页面标题
    await expect(page).toHaveTitle(/ops-triage/)
  })

  test('应该显示导航链接', async ({ page }) => {
    await page.goto('/')

    // 检查是否有 Git 项目选择链接
    const gitProjectsLink = page.locator('a[href*="/git/projects"]')
    await expect(gitProjectsLink).toBeVisible()

    // 检查是否有 URL 分诊链接
    const triageLink = page.locator('a[href*="/triage"]')
    await expect(triageLink).toBeVisible()
  })

  test('应该能导航到 Git 项目页面', async ({ page }) => {
    await page.goto('/')

    // 点击 Git 项目链接
    await page.click('a[href*="/git/projects"]')

    // 检查是否跳转到正确页面
    await expect(page).toHaveURL(/.*\/git\/projects/)

    // 检查页面内容
    await expect(page.locator('h1, h2, h3, h4')).toContainText('GitLab')
  })

  test('应该能导航到 URL 分诊页面', async ({ page }) => {
    await page.goto('/')

    // 点击 URL 分诊链接
    await page.click('a[href*="/triage"]')

    // 检查是否跳转到正确页面
    await expect(page).toHaveURL(/.*\/triage/)

    // 检查页面内容
    await expect(page.locator('h1, h2, h3, h4')).toContainText('URL')
  })
})
