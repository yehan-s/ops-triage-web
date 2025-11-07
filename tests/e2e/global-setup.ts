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

  // Spawn backend on configurable port (default 7001). Playwright config passes VITE_API_BASE_URL accordingly.
  const apiPort = String(process.env.E2E_API_PORT || '7001')
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
    env: { ...process.env, PORT: apiPort, FRONTEND_ORIGIN: 'http://localhost:5173' },
  })
  fs.writeFileSync(path.join(webRoot, '.e2e-server.pid'), String(child.pid || ''))
  await waitHttp(`http://localhost:${apiPort}/metrics`, 20000)
}
