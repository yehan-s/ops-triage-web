# ops-triage Web（前端）

React + Vite 的前端，提供 Git 项目选择、分支索引触发与 URL 分诊界面。

## 快速开始

要求：Node.js 20、pnpm@9

```bash
pnpm install
cp .env.example .env             # 确认 API 地址
pnpm dev                         # Vite 启动在 http://localhost:5173
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

## 质量与提交前钩子

```bash
pre-commit install
```

- 代码风格：Prettier（见 `.pre-commit-config.yaml` / `.prettierignore`）
- 统一包管理：`packageManager: pnpm@9`
- CI：`web/.github/workflows/ci.yml` 使用 pnpm@9，构建并上传 `web/dist` 工件

## 故障排查

- 页面提示“后端 Token 未配置”：后端 `server/.env` 缺少 `GITLAB_ACCESS_TOKEN` / `GITLAB_TOKEN`
- 跨域：确保后端 `FRONTEND_ORIGIN=http://localhost:5173`
- 404/500：检查 `VITE_API_BASE_URL` 是否指向正确后端端口

## 关联 ADR（在 server 子仓）

- `server/docs/architecture/ADR-001-Tech-Stack.md`
- `server/docs/architecture/ADR-002-Architecture-Design.md`
- `server/docs/architecture/ADR-003-Quality-And-Ops.md`
- `server/docs/architecture/ADR-004-Triage-Strategy.md`
