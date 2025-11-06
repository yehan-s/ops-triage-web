import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { post } from '../lib/api'
import { Button, List, Space, Typography, message } from 'antd'

export default function Branches() {
  const { projectId } = useParams<{ projectId: string }>()
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

  return (
    <Space direction="vertical" style={{ padding: 24, width: '100%' }}>
      <Typography.Title level={4}>选择分支（项目 {projectId}）</Typography.Title>
      <Button onClick={() => refetch()} loading={isLoading}>
        刷新
      </Button>
      <List
        bordered
        dataSource={data?.branches || []}
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
