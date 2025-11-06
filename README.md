# ops-triage Web（前端）

React + Vite 的前端，提供 Git 项目选择、分支索引触发与 URL 分诊界面。

## 快速开始

要求：Node.js 20、pnpm@9

```bash
corepack enable && corepack prepare pnpm@9.0.0 --activate
pnpm install
cp .env.example .env             # 确认 API 地址
pnpm dev                         # Vite 启动在 http://localhost:5173
```

### 前后端联调 E2E（Playwright）

```bash
# 确保 server 依赖已安装，并在 web 仓库同级存在 ../server
pnpm -C ../server install

# 运行 E2E：会自动在随机端口启动后端，并用该地址启动 Vite
pnpm e2e
```

- 服务端对应：`VITE_API_BASE_URL=http://localhost:7000`（与后端端口一致）
- 一键联调：参考根目录 `scripts/dev.sh` 同时启动 server+web

## 主要页面

- `/`：入口页（链接到 Git 项目选择与 URL 分诊）
- `/git/projects`：
  - 调用 `GET /git/config` 检查后端 Token 是否配置
  - `POST /git/projects` 支持 `search` 过滤
- `/git/branches/:projectId`：
  - `POST /git/branches` 拉取分支
  - 点击“API 索引”调用 `POST /git/api-index` 生成/更新 `server/data/index.json`
- `/triage`：
  - 调用 `POST /triage`，展示 `{ routeMatch, owners, domain, suggestions, ... }` 的 JSON

实现参考：

- `src/lib/api.ts`（封装 `get/post`，基于 `VITE_API_BASE_URL`）
- `src/pages/*.tsx`（React Router + antd + React Query）

## 构建与预览

```bash
pnpm build
pnpm preview -- --port 5173
```

产物默认在 `web/dist`。

## 代码质量检查

### ESLint（代码检查）

```bash
# 检查代码问题
pnpm run lint

# 自动修复问题
pnpm run lint:fix
```

### Prettier（格式化）

```bash
# 格式化代码
pnpm run fmt

# 检查格式（CI 使用）
pnpm run fmt:check
```

## 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式（开发时推荐）
pnpm test:watch

# UI 界面（可视化测试结果）
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage
```

### 测试框架

- **Vitest**: 快速的单元测试框架
- **@testing-library/react**: React 组件测试
- **@testing-library/user-event**: 模拟用户交互
- **@testing-library/jest-dom**: 扩展断言

### 编写测试

测试文件放在 `__tests__` 目录或使用 `.test.ts(x)` 后缀：

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

参考示例：`src/lib/__tests__/api.test.ts`

## 质量与提交前钩子

两种方式二选一：

1) 本仓库自带原生 Git hook（轻量推荐）

```bash
bash scripts/install-git-hooks.sh   # 安装 pre-commit（仅跑 pnpm run fmt:check）
```

2) 如果你已使用 pre-commit 框架，可继续沿用（需自行维护配置）

- 代码风格：Prettier（见 `.prettierignore`）
- 统一包管理：`packageManager: pnpm@9.0.0`（Corepack）
- CI：`web/.github/workflows/ci.yml` 已包含 Format/Lint/Test 和可选 E2E

## 故障排查

- 页面提示“后端 Token 未配置”：后端 `server/.env` 缺少 `GITLAB_ACCESS_TOKEN` / `GITLAB_TOKEN`
- 跨域：确保后端 `FRONTEND_ORIGIN=http://localhost:5173`
- 404/500：检查 `VITE_API_BASE_URL` 是否指向正确后端端口

## 关联 ADR（在 server 子仓）

- `server/docs/architecture/ADR-001-Tech-Stack.md`
- `server/docs/architecture/ADR-002-Architecture-Design.md`
- `server/docs/architecture/ADR-003-Quality-And-Ops.md`
- `server/docs/architecture/ADR-004-Triage-Strategy.md`
