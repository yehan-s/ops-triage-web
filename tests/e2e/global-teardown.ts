import fs from 'fs'
import path from 'path'

export default async function globalTeardown() {
  const webRoot = process.cwd()
  const pidFile = path.join(webRoot, '.e2e-server.pid')
  if (fs.existsSync(pidFile)) {
    const pid = Number(fs.readFileSync(pidFile, 'utf8') || 0)
    if (pid) {
      try { process.kill(pid, 'SIGTERM') } catch {}
    }
    try { fs.unlinkSync(pidFile) } catch {}
  }
}

