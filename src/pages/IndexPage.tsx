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
      </Space>
    </Space>
  )
}
