import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { post, get } from '../lib/api'
import { Button, Input, Space, Table, Typography, Alert } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function Projects(){
  const nav = useNavigate()
  const [search, setSearch] = React.useState('')
  const { data: cfg } = useQuery({ queryKey:['gitcfg'], queryFn:()=>get<{baseUrl:string|null, tokenPresent:boolean}>('/git/config') })
  const { data, refetch, isFetching } = useQuery({ queryKey:['projects',search], queryFn:()=>post<{projects:any[]}>('/git/projects',{search}), enabled:false })

  return (
    <Space direction="vertical" style={{ padding:24, width:'100%' }}>
      <Typography.Title level={4}>选择 GitLab 项目</Typography.Title>
      <Alert type={cfg?.tokenPresent? 'success':'warning'} message={`后端Token：${cfg?.tokenPresent? '已配置': '未配置'}`} description={`BaseURL: ${cfg?.baseUrl||'-'}`} />
      <Space>
        <Input placeholder="搜索" value={search} onChange={e=>setSearch(e.target.value)} style={{ width: 320 }} />
        <Button type="primary" onClick={()=>refetch()} loading={isFetching}>查询</Button>
      </Space>
      <Table rowKey={(r:any)=>r.id} dataSource={data?.projects||[]} columns={[
        { title:'ID', dataIndex:'id' },
        { title:'路径', dataIndex:'path_with_namespace' },
        { title:'默认分支', dataIndex:'default_branch' },
        { title:'操作', render:(_:any, r:any)=> <Button onClick={()=>nav(`/git/branches/${r.id}`)}>选择分支</Button> }
      ]} pagination={{ pageSize: 10 }} />
    </Space>
  )
}
