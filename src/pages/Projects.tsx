import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { post, get } from '../lib/api'
import { Button, Input, Space, Table, Typography, Alert } from 'antd'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

export default function Projects() {
  const nav = useNavigate()
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { data: cfg } = useQuery({
    queryKey: ['gitcfg'],
    queryFn: () => get<{ baseUrl: string | null; tokenPresent: boolean }>('/git/config'),
  })
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['projects', search, page, pageSize],
    queryFn: () =>
      post<{ projects: any[]; total: number; page: number; pageSize: number }>('/git/projects', {
        search,
        page,
        pageSize,
      }),
    enabled: !!cfg?.tokenPresent,
  })

  return (
    <Space direction="vertical" style={{ padding: 24, width: '100%' }}>
      <Typography.Title level={4}>选择 GitLab 项目</Typography.Title>
      <Alert
        type={cfg?.tokenPresent ? 'success' : 'warning'}
        message={`后端Token：${cfg?.tokenPresent ? '已配置' : '未配置'}`}
        description={`BaseURL: ${cfg?.baseUrl || '-'}`}
      />
      <Space>
        <Input
          placeholder="搜索项目名称"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1) // 搜索时重置到第一页
          }}
          onPressEnter={() => {
            setPage(1)
            refetch()
          }}
          style={{ width: 320 }}
        />
        <Button
          type="primary"
          onClick={() => {
            setPage(1)
            refetch()
          }}
          loading={isFetching}
          disabled={!cfg?.tokenPresent}
        >
          查询
        </Button>
        {!cfg?.tokenPresent && (
          <Link to="/upload">
            <Button type="default">使用离线模式（上传 ZIP）</Button>
          </Link>
        )}
      </Space>
      <Table
        rowKey={(r: any) => r.id}
        dataSource={data?.projects || []}
        loading={isFetching}
        columns={[
          { title: 'ID', dataIndex: 'id' },
          { title: '路径', dataIndex: 'path_with_namespace' },
          { title: '默认分支', dataIndex: 'default_branch' },
          {
            title: '操作',
            render: (_: any, r: any) => (
              <Button onClick={() => nav(`/git/branches/${r.id}`)}>选择分支</Button>
            ),
          },
        ]}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: total => `共 ${total} 个项目`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage)
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize)
              setPage(1) // 改变每页条数时重置到第一页
            }
          },
        }}
      />
    </Space>
  )
}
