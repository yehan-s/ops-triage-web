#!/usr/bin/env node
const ua = process.env.npm_config_user_agent || ''
if (!/pnpm\//.test(ua)) {
  console.error('\n\u274C 本项目使用 pnpm。请先执行：\n')
  console.error('   corepack enable && corepack prepare pnpm@9.0.0 --activate')
  console.error('然后使用 pnpm 安装：')
  console.error('   pnpm install\n')
  process.exit(1)
}
