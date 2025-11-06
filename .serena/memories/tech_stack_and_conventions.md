# 技术栈与代码约定

## TypeScript 配置
- **严格模式**：启用（strict: true）
- **目标**：ES2020
- **模块**：ESNext（Vite bundler）
- **JSX**：react-jsx（React 17+ 新 JSX 转换）

## 代码组织

### 文件命名
- **组件文件**：PascalCase（如 `Projects.tsx`, `Triage.tsx`）
- **工具文件**：camelCase（如 `api.ts`）
- **配置文件**：标准名称（如 `vite.config.ts`）

### 组件结构
```tsx
// 推荐结构
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Card } from 'antd'

export function MyComponent() {
  // 1. hooks
  const { data, isLoading } = useQuery(...)
  
  // 2. handlers
  const handleClick = () => { ... }
  
  // 3. render
  return (
    <Card>
      <Button onClick={handleClick}>...</Button>
    </Card>
  )
}
```

### API 调用
使用 `src/lib/api.ts` 封装的 `get/post` 函数：
```typescript
import { get, post } from '@/lib/api'

// GET 请求
const data = await get('/git/config')

// POST 请求
const result = await post('/triage', { url, logs })
```

## 状态管理策略
- **服务端状态**：React Query（缓存、重试、自动刷新）
- **客户端状态**：React hooks（useState, useReducer）
- **URL 状态**：React Router（useParams, useSearchParams）

## UI 组件
使用 Ant Design 5：
- Layout: `<Card>`, `<Layout>`, `<Space>`
- Form: `<Form>`, `<Input>`, `<Button>`
- Feedback: `<Spin>`, `<Alert>`, `<message>`
- Data: `<Table>`, `<List>`, `<Descriptions>`

## 样式策略
- 优先使用 Ant Design 组件的内置样式
- 必要时使用 CSS-in-JS 或 CSS Modules
- 避免全局样式污染

## 错误处理
```typescript
try {
  const data = await post('/triage', payload)
  // 成功处理
} catch (error) {
  message.error('分诊失败：' + error.message)
}
```

## 环境变量
- 使用 `import.meta.env.VITE_*` 访问
- 示例：`import.meta.env.VITE_API_BASE_URL`

## 当前缺失（需要补充）
- ❌ ESLint 配置
- ❌ Prettier 配置文件（虽然 pre-commit 有）
- ❌ 测试框架
- ❌ 代码规范文档