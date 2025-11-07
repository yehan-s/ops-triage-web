import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, patch, del } from '../lib/api'
import { Button, Space, Table, Typography, Popconfirm, message } from 'antd'

type Project = { key: string; alias: string; routes: number; owners: number; updatedAt: string }

export default function OfflineProjects() {
  const qc = useQueryClient()
  const { data, isFetching } = useQuery({
    queryKey: ['offline-projects'],
    queryFn: () => get<{ projects: Project[] }>('/offline/projects'),
  })

  const rename = useMutation({
    mutationFn: async (p: Project) => {
      const alias = window.prompt('输入新的别名', p.alias || p.key)
      if (!alias) throw new Error('取消')
      return patch('/offline/projects/' + encodeURIComponent(p.key), { alias })
    },
    onSuccess: () => {
      message.success('已更新别名')
      qc.invalidateQueries({ queryKey: ['offline-projects'] })
    },
    onError: (e: any) => message.error(String(e?.message || e)),
  })

  const remove = useMutation({
    mutationFn: async (p: Project) => {
      await del('/offline/projects/' + encodeURIComponent(p.key))
    },
    onSuccess: () => {
      message.success('已删除')
      qc.invalidateQueries({ queryKey: ['offline-projects'] })
    },
    onError: (e: any) => message.error(String(e?.message || e)),
  })

  const projects = data?.projects || []

  return (
    <Space direction="vertical" style={{ padding: 24, width: '100%' }} size="large">
      <Typography.Title level={4}>离线项目管理</Typography.Title>
      <Table
        rowKey={r => r.key}
        loading={isFetching}
        dataSource={projects}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: 'Key', dataIndex: 'key' },
          { title: '名称', dataIndex: 'alias' },
          { title: 'routes', dataIndex: 'routes', width: 100 },
          { title: 'owners', dataIndex: 'owners', width: 100 },
          { title: '更新时间', dataIndex: 'updatedAt' },
          {
            title: '操作',
            width: 200,
            render: (_: any, r: Project) => (
              <Space>
                <Button size="small" onClick={() => rename.mutate(r)}>
                  重命名
                </Button>
                <Popconfirm title={`删除 ${r.alias || r.key}?`} onConfirm={() => remove.mutate(r)}>
                  <Button size="small" danger>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </Space>
  )
}
