import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { post } from '../lib/api'
import { Button, List, Space, Typography, message, Input } from 'antd'

export default function Branches() {
  const { projectId } = useParams<{ projectId: string }>()
  const [search, setSearch] = React.useState('')
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['branches', projectId],
    queryFn: () => post<{ branches: any[] }>('/git/branches', { projectId }),
    enabled: !!projectId,
  })
  const idx = useMutation({
    mutationFn: (branch: string) =>
      post<{ indexed: number; owners: number; warnings: string[]; files: number }>(
        '/git/api-index',
        { projectId, branch }
      ),
  })

  // 客户端过滤分支
  const filteredBranches = React.useMemo(() => {
    if (!search.trim()) return data?.branches || []
    const searchLower = search.toLowerCase()
    return (data?.branches || []).filter((b: any) => b.name.toLowerCase().includes(searchLower))
  }, [data?.branches, search])

  return (
    <Space direction="vertical" style={{ padding: 24, width: '100%' }}>
      <Typography.Title level={4}>选择分支（项目 {projectId}）</Typography.Title>
      <Space>
        <Input
          placeholder="搜索分支名称"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
        <Button onClick={() => refetch()} loading={isLoading}>
          刷新
        </Button>
      </Space>
      <List
        bordered
        dataSource={filteredBranches}
        renderItem={(b: any) => (
          <List.Item
            actions={[
              <Button
                type="link"
                onClick={async () => {
                  const r = await idx.mutateAsync(b.name)
                  message.success(
                    `索引完成：routes=${r.indexed}, owners=${r.owners}, files=${r.files}`
                  )
                }}
              >
                API 索引
              </Button>,
            ]}
          >
            <List.Item.Meta title={b.name} description={b.commit?.id} />
          </List.Item>
        )}
      />
    </Space>
  )
}
