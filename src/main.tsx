import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import zhCN from 'antd/locale/zh_CN'
import Projects from './pages/Projects'
import Branches from './pages/Branches'
import IndexPage from './pages/IndexPage'
import Triage from './pages/Triage'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  { path: '/', element: <IndexPage/> },
  { path: '/git/projects', element: <Projects/> },
  { path: '/git/branches/:projectId', element: <Branches/> },
  { path: '/triage', element: <Triage/> },
])

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
