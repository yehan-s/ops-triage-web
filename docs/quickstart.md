# ops-triage Web 快速上手

## 目标

- 控制台 UI：选择 GitLab 项目/分支触发索引；在“URL 分诊”页调用后端 `/triage` 展示结果
- 与后端的契约：通过 `VITE_API_BASE_URL` 指向 server（Fastify@7000），调用 `/git/*` 与 `/triage`

## 技术栈

- TypeScript 5 + Vite 5
- React 18、React Router 6、@tanstack/react-query、Ant Design 5
- 测试：Vitest（组件）+ Playwright（E2E）
- 包管理：pnpm 9（Corepack 固定 `packageManager=pnpm@9.0.0`）
- CI：GitHub Actions（build + e2e）

## 环境与安装

```bash
# 一次性（根或 web/ 任意位置）
corepack enable && corepack prepare pnpm@9.0.0 --activate

# 安装依赖
pnpm install
cp .env.example .env   # 确认 VITE_API_BASE_URL=http://localhost:7000
```

## 开发与联调

```bash
# 启动前端（http://localhost:5173）
pnpm dev
```

- 后端需在 7000 端口；跨域通过后端环境 `FRONTEND_ORIGIN=http://localhost:5173`
- 根目录也可一键联调：`bash scripts/dev.sh`（只用 pnpm）

## 测试

- 组件测试

```bash
pnpm test
```

- E2E（浏览器）

```bash
pnpm exec playwright install chromium   # 首次
pnpm e2e
```

E2E 会在 globalSetup 启动真实后端（Fastify@7000）并写入最小 index.json；流程用例覆盖：

- /triage 命中
- 项目 → 分支 → API 索引 → 分诊

## 代码质量

```bash
# 全仓格式化（提交前建议）
pnpm run fmt
# 格式校验（CI 使用）
pnpm run fmt:check
# 安装本地提交钩子（仅检查格式）
bash scripts/install-git-hooks.sh
```

## 目录结构（要点）

- `src/pages/`：Index/Projects/Branches/Triage
- `src/lib/api.ts`：get/post 封装（基于 `VITE_API_BASE_URL`）
- `tests/e2e/*`：Playwright E2E（真实后端 + 路由拦截）
- `src/pages/__tests__/*`：RTL 组件测试

## 常见问题

- “后端 Token 未配置”：检查 server/.env 中 `GITLAB_ACCESS_TOKEN|GITLAB_TOKEN`
- CORS 报错：server/.env 设置 `FRONTEND_ORIGIN=http://localhost:5173`
- /triage 未命中：先在分支页执行 “API 索引”，或手动写入最小 index.json
