# ops-triage Web 前端项目概述

## 项目目的
ops-triage 的前端界面，提供 GitLab 项目选择、分支索引触发和 URL 问题分诊功能。

## 核心功能
1. **Git 项目管理**：列出 GitLab 项目，支持搜索
2. **分支索引**：选择分支并触发 API 索引构建
3. **URL 分诊**：输入 URL 和日志，展示分诊结果（路由匹配、负责人、建议）

## 技术栈
- **框架**：React 18
- **构建工具**：Vite 5
- **语言**：TypeScript（严格模式）
- **UI 库**：Ant Design 5
- **状态管理**：React Query (TanStack Query)
- **路由**：React Router v6
- **表单验证**：Zod
- **包管理**：pnpm 9

## 目录结构
```
src/
├── lib/           # 工具库
│   └── api.ts     # API 调用封装
├── pages/         # 页面组件
│   ├── IndexPage.tsx
│   ├── Projects.tsx
│   ├── Branches.tsx
│   └── Triage.tsx
└── main.tsx       # 入口文件
```

## 主要页面
- `/` - 首页入口
- `/git/projects` - 项目列表和选择
- `/git/branches/:projectId` - 分支列表和索引触发
- `/triage` - URL 分诊界面