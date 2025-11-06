# 前端开发常用命令

## 开发命令

### 启动开发服务器
```bash
pnpm dev
# 访问 http://localhost:5173
```

### 构建生产版本
```bash
pnpm build
# 输出到 dist/ 目录
```

### 预览生产构建
```bash
pnpm preview
# 在 http://localhost:5173 预览
```

## 包管理
```bash
# 安装依赖
pnpm install

# 添加依赖
pnpm add <package>

# 添加开发依赖
pnpm add -D <package>

# 更新依赖
pnpm update
```

## Git 操作
```bash
# 查看状态
git status

# 创建功能分支
git checkout -b feature/<issue-id>-<description>

# 提交（Conventional Commits）
git commit -m "feat: add something"
git commit -m "fix: resolve issue"

# 同步主干
git pull --rebase origin main

# 强制推送
git push --force-with-lease
```

## pre-commit hooks
```bash
# 首次安装
pre-commit install

# 手动运行所有 hooks
pre-commit run --all-files
```

## 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env
# VITE_API_BASE_URL=http://localhost:7000
```