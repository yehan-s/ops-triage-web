import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}
async function waitHttp(url: string, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  let lastErr: any
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch (e) {
      lastErr = e
    }
    await delay(150)
  }
  throw new Error(`waitHttp timeout: ${url}: ${lastErr?.message || lastErr}`)
}

export default async function globalSetup() {
  // Locate server repo: prefer sibling ../server; fallback to ./server (CI checkout)
  const webRoot = process.cwd()
  const candidates = [path.resolve(webRoot, '../server'), path.resolve(webRoot, 'server')]
  const serverRoot = candidates.find(p => fs.existsSync(p)) || candidates[0]
  if (!fs.existsSync(serverRoot)) {
    console.warn('[e2e] server repo not found, skipping real backend setup')
    process.env.E2E_SKIP = '1'
    return
  }

  // Prepare minimal index.json to ensure /triage matches
  const dataDir = path.join(serverRoot, 'data')
  fs.mkdirSync(dataDir, { recursive: true })
  const idx = {
    routes: [
      { repoName: 'demo', framework: 'express', routePattern: '/api/foo', file: 'src/foo.js' },
    ],
    owners: [{ pathGlob: 'src/**', owners: ['@team-a'], source: 'TEST' }],
  }
  fs.writeFileSync(path.join(dataDir, 'index.json'), JSON.stringify(idx))

  // Load .env from server directory if exists
  const envFile = path.join(serverRoot, '.env')
  const envVars: Record<string, string> = {}
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=\s]+)=(.*)$/)
      if (match) envVars[match[1]] = match[2].trim()
    })
  }
  // Spawn backend on可配置端口：优先 E2E_API_PORT，其次 server/.env 的 PORT，再次进程 PORT，默认 7001。
  const apiPort = String(process.env.E2E_API_PORT || envVars.PORT || process.env.PORT || '7001')
  const metricsUrl = `http://localhost:${apiPort}/metrics`
  try {
    // 快速探测：若已有服务，直接复用
    await waitHttp(metricsUrl, 1500)
    console.log(`[e2e] Reusing existing backend at ${metricsUrl}`)
    return
  } catch {}
  const tsxBin = path.join(
    serverRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'tsx.cmd' : 'tsx'
  )
  if (!fs.existsSync(tsxBin))
    throw new Error('[e2e] missing server deps. Run pnpm -C server install')
  const entry = path.join(serverRoot, 'src', 'api', 'fastify-server.ts')
  const child = spawn(tsxBin, [entry], {
    cwd: serverRoot,
    stdio: 'ignore',
    env: { ...process.env, ...envVars, PORT: apiPort, FRONTEND_ORIGIN: 'http://localhost:5173' },
  })
  fs.writeFileSync(path.join(webRoot, '.e2e-server.pid'), String(child.pid || ''))
  // 绑定退出监控，若进程异常退出，快速失败，避免长等待
  let exited = false
  child.on('exit', () => {
    exited = true
  })
  const deadline = Date.now() + 20000
  let lastErr: any
  while (Date.now() < deadline) {
    try {
      const res = await fetch(metricsUrl)
      if (res.ok) return
    } catch (e) {
      lastErr = e
    }
    if (exited) throw new Error('[e2e] backend exited during startup (check port or deps)')
    await delay(150)
  }
  throw new Error(`[e2e] backend did not start at ${metricsUrl}: ${lastErr?.message || lastErr}`)
}
