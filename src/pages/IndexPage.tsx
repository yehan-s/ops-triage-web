import React from 'react'
import { Button, Space, Typography } from 'antd'
import { Link } from 'react-router-dom'

export default function IndexPage() {
  return (
    <Space direction="vertical" size="large" style={{ padding: 24 }}>
      <Typography.Title level={3}>ops-triage 控制台</Typography.Title>
      <Space>
        <Link to="/git/projects">
          <Button type="primary">选择 GitLab 项目</Button>
        </Link>
        <Link to="/triage">
          <Button>URL 分诊</Button>
        </Link>
        <Link to="/upload">
          <Button>离线包上传</Button>
        </Link>
        <Link to="/offline">
          <Button>离线项目管理</Button>
        </Link>
      </Space>
      <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
        CLI 快捷：在 <code>server/</code> 目录运行
        <br />
        <code>pnpm index-offline -- --server http://localhost:7000 ./your.zip</code>
        ，更多用法见
        <a
          style={{ marginLeft: 6 }}
          href="https://github.com/yehan-s/ops-triage-server#%E7%A6%BB%E7%BA%BF%E6%A8%A1%E5%BC%8F%E6%94%AF%E6%8C%81-ui-%E4%B8%8E-cli"
          target="_blank"
          rel="noreferrer"
        >
          离线模式说明
        </a>
      </Typography.Paragraph>
    </Space>
  )
}
