import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import zhCN from 'antd/locale/zh_CN'

// 路由懒加载：降低首包体积
const IndexPage = lazy(() => import('./pages/IndexPage'))
const Projects = lazy(() => import('./pages/Projects'))
const Branches = lazy(() => import('./pages/Branches'))
const Triage = lazy(() => import('./pages/Triage'))

const queryClient = new QueryClient()

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
          <IndexPage />
        </Suspense>
      ),
    },
    {
      path: '/git/projects',
      element: (
        <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
          <Projects />
        </Suspense>
      ),
    },
    {
      path: '/git/branches/:projectId',
      element: (
        <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
          <Branches />
        </Suspense>
      ),
    },
    {
      path: '/triage',
      element: (
        <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
          <Triage />
        </Suspense>
      ),
    },
  ],
  {
    // 预先启用 v7 行为，清理警告并减少未来升级风险
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <QueryClientProvider client={queryClient}>
        <AntApp>
          <RouterProvider router={router} />
        </AntApp>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>
)
