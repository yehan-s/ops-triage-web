import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { post } from '../lib/api'
import { Button, Input, Space, Typography } from 'antd'

export default function Triage(){
  const [url, setUrl] = React.useState('')
  const [logs, setLogs] = React.useState('')
  const triage = useMutation({ mutationFn: ()=>post<any>('/triage',{ url, description: logs }) })

  return (
    <Space direction="vertical" style={{ padding:24, width:'100%' }}>
      <Typography.Title level={4}>URL 分诊</Typography.Title>
      <Input placeholder="URL" value={url} onChange={e=>setUrl(e.target.value)} />
      <Input.TextArea rows={6} placeholder="问题/日志（可选）" value={logs} onChange={e=>setLogs(e.target.value)} />
      <Button type="primary" onClick={()=>triage.mutate()} loading={triage.isLoading}>分析</Button>
      {triage.data && (
        <pre style={{ background:'#f6f8fa', padding:12, whiteSpace:'pre-wrap' }}>{JSON.stringify(triage.data,null,2)}</pre>
      )}
    </Space>
  )
}
