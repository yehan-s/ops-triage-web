import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { post } from '../lib/api'
import { Button, Space, Typography, Upload, Input, message, Alert } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { useNavigate } from 'react-router-dom'

async function fileToBase64(f: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const s = String(reader.result || '')
      const base64 = s.includes(',') ? s.split(',')[1] : s
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(f)
  })
}

export default function UploadPage() {
  const nav = useNavigate()
  const [fileList, setFileList] = React.useState<UploadFile[]>([])
  const [owners, setOwners] = React.useState('')

  const mutate = useMutation({
    mutationFn: async () => {
      if (!fileList.length) throw new Error('请先选择至少一个 ZIP 包')
      const files: File[] = fileList
        .map(f => f.originFileObj as File | undefined)
        .filter(Boolean) as File[]
      const bundles = [] as any[]
      for (const f of files) {
        const contentBase64 = await fileToBase64(f)
        bundles.push({ name: f.name, type: 'zip', contentBase64 })
      }
      let ownersJson: any = undefined
      if (owners.trim()) {
        try {
          const parsed = JSON.parse(owners)
          if (Array.isArray(parsed)) ownersJson = parsed
          else throw new Error('owners.json 必须是数组')
        } catch (e: any) {
          throw new Error('owners.json 非法：' + (e?.message || e))
        }
      }
      const res = await post<any>('/index', { bundles, ownersJson })
      return res
    },
    onSuccess: r => {
      message.success(
        `索引完成：repos=${r.indexedRepos ?? '-'}, routes=${r.routes}, owners=${r.owners}`
      )
      nav('/triage')
    },
    onError: e => {
      message.error(String((e as any)?.message || e))
    },
  })

  return (
    <Space direction="vertical" style={{ padding: 24, width: '100%' }} size="large">
      <Typography.Title level={4}>离线索引：上传 ZIP 包</Typography.Title>
      <Alert
        type="info"
        message="无需 GitLab Token"
        description="选择一个或多个项目的 ZIP 包进行离线索引；可选附加 owners.json（数组形式）。"
      />
      <Upload.Dragger
        multiple
        fileList={fileList}
        beforeUpload={() => false}
        onChange={info => setFileList(info.fileList)}
        accept=".zip"
      >
        <p className="ant-upload-drag-icon">📦</p>
        <p className="ant-upload-text">点击或拖拽 ZIP 包到此处</p>
        <p className="ant-upload-hint">支持多个 ZIP；文件不会自动上传，提交时一并发送到后端</p>
      </Upload.Dragger>
      <Typography.Text>可选：owners.json（数组）</Typography.Text>
      <Input.TextArea
        rows={6}
        placeholder='例如：[{"pathGlob":"src/**","owners":["@team-a"]}]'
        value={owners}
        onChange={e => setOwners(e.target.value)}
      />
      <Space>
        <Button type="primary" loading={mutate.isLoading} onClick={() => mutate.mutate()}>
          开始索引
        </Button>
        <Button onClick={() => nav('/triage')}>去分诊</Button>
      </Space>
    </Space>
  )
}
