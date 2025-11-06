import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// 真实后端已由 globalSetup 启动在 7000 端口
test('projects -> branches -> API index -> triage (real backend, stub GitLab)', async ({ page }) => {
  // 计算 server 根目录以便写入 index.json
  const webRoot = process.cwd()
  const candidates = [path.resolve(webRoot, '../server'), path.resolve(webRoot, 'server')]
  const serverRoot = candidates.find(p => fs.existsSync(p)) || candidates[0]
  const dataDir = path.join(serverRoot, 'data')
  fs.mkdirSync(dataDir, { recursive: true })

  // 拦截 GitLab 相关请求，返回假数据
  await page.route('**/git/config', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ baseUrl: 'https://gitlab.example', tokenPresent: true })
  }))
  await page.route('**/git/projects', async route => {
    const body = { projects: [{ id: 123, path_with_namespace: 'demo/x', default_branch: 'main' }] }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
  await page.route('**/git/branches', async route => {
    const body = { branches: [{ name: 'main', commit: { id: 'abc' } }] }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
  await page.route('**/git/api-index', async route => {
    // 写入最小 index.json，使 /triage 能命中
    const idx = {
      routes: [{ repoName: 'demo', framework: 'express', routePattern: '/api/foo', file: 'src/foo.js' }],
      owners: [{ pathGlob: 'src/**', owners: ['@team-a'], source: 'TEST' }],
    }
    fs.writeFileSync(path.join(dataDir, 'index.json'), JSON.stringify(idx))
    const body = { indexed: 1, owners: 1, warnings: [], files: 1 }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })

  // 流程：项目 -> 分支 -> API 索引
  await page.goto('/git/projects')
  await expect(page.locator('text=后端Token：已配置')).toBeVisible()
  await page.getByPlaceholder('搜索').fill('demo')
  await page.getByRole('button', { name: /查.?询/ }).click()
  await expect(page.getByText('demo/x')).toBeVisible()
  await page.getByRole('button', { name: '选择分支' }).click()

  await expect(page.getByText('选择分支（项目 123）')).toBeVisible()
  await page.getByRole('button', { name: '刷新' }).click()
  await expect(page.getByText('main')).toBeVisible()
  await page.getByRole('button', { name: 'API 索引' }).click()
  // 成功提示
  await expect(page.locator('.ant-message')).toContainText('索引完成', { timeout: 5000 })

  // 分诊页命中
  await page.goto('/triage')
  await page.getByPlaceholder('URL').fill('/api/foo')
  await page.getByRole('button', { name: /分.?析/ }).click()
  await expect(page.locator('pre')).toContainText('"pattern": "/api/foo"', { timeout: 10000 })
})

