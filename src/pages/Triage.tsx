import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { get, post } from '../lib/api'
import { Button, Input, Space, Typography, Select } from 'antd'

export default function Triage() {
  const [url, setUrl] = React.useState('')
  const [logs, setLogs] = React.useState('')
  const { data: projects } = useQuery({
    queryKey: ['offline-projects'],
    queryFn: () => get<{ projects: { key: string; alias: string }[] }>('/offline/projects'),
  })
  const [project, setProject] = React.useState<string | undefined>(undefined)
  const triage = useMutation({
    mutationFn: () => post<any>('/triage', { url, description: logs, project }),
  })

  return (
    <Space direction="vertical" style={{ padding: 24, width: '100%' }}>
      <Typography.Title level={4}>URL 分诊</Typography.Title>
      <Input placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} />
      <Space>
        <Select
          allowClear
          placeholder="选择离线项目（可选）"
          style={{ minWidth: 320 }}
          value={project}
          onChange={setProject}
          options={(projects?.projects || []).map(p => ({
            value: p.key,
            label: (p.alias || p.key) + (p.branch ? ` (${p.branch})` : ''),
          }))}
        />
      </Space>
      <Input.TextArea
        rows={6}
        placeholder="问题/日志（可选）"
        value={logs}
        onChange={e => setLogs(e.target.value)}
      />
      <Button type="primary" onClick={() => triage.mutate()} loading={triage.isLoading}>
        分析
      </Button>
      {triage.data && (
        <pre style={{ background: '#f6f8fa', padding: 12, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(triage.data, null, 2)}
        </pre>
      )}
    </Space>
  )
}
