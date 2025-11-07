import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { post } from '../lib/api'
import { Button, Space, Typography, Upload, Input, message, Alert, Switch, Divider } from 'antd'
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
  const [overwrite, setOverwrite] = React.useState(false)
  const [aliases, setAliases] = React.useState<Record<string, string>>({})
  const [branches, setBranches] = React.useState<Record<string, string>>({})

  // 与后端保持一致的 repo/key 推导（见 server/src/api/index-upload.js）
  const repoNameFromFile = (name: string) => {
    const base = (name.replace(/[^A-Za-z0-9._-]/g, '_').replace(/\.[^.]+$/, '') || 'project')
    const m = base.match(/^(.*?)[@#]([^@#]+)$/)
    return m ? m[1] : base
  }
  const keyFromRepoName = (repo: string) =>
    ((repo.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')) || 'project').slice(0, 80)
  const branchFromFile = (name: string) => {
    const base = (name.replace(/\.[^.]+$/, '') || '')
    // 1) @ 或 #
    let m = base.match(/^(.*?)[@#]([^@#]+)$/)
    if (m) return m[2]
    const isLikelyBranch = (s: string) => {
      if (!s) return false
      const t = s.toLowerCase()
      if (t === 'main' || t === 'master' || t === 'develop' || t === 'dev') return true
      if (/^(release|feature|hotfix|fix|bugfix)[\/_-].+/.test(t)) return true
      if (/^v?\d+(?:\.\d+){0,2}.*/.test(t)) return true
      return false // 不做泛化匹配，避免误判
    }
    // 2) 下划线：最后一段
    const us = base.lastIndexOf('_')
    if (us > 0) {
      const br = base.slice(us + 1)
      if (isLikelyBranch(br)) return br
    }
    // 3) 连字符：最后一段
    const hs = base.lastIndexOf('-')
    if (hs > 0) {
      const br = base.slice(hs + 1)
      if (isLikelyBranch(br)) return br
    }
    return ''
  }
  const projectKeyFromFile = (name: string) => {
    const repo = repoNameFromFile(name)
    const key = keyFromRepoName(repo)
    const br = (branches[repo] ?? branchFromFile(name) ?? '').trim()
    if (!br) return key
    const brSan = br.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
    return `${key}-${brSan}`
  }

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
      // 组装 aliases：将每个文件的别名同时写入 repoName 与 key 两个键，避免客户端与服务端清洗差异导致不匹配
      const aliasesPayload: Record<string, string> = {}
      const branchesPayload: Record<string, string> = {}
      for (const f of fileList) {
        const name = f.name || ''
        const repo = repoNameFromFile(name)
        const key = keyFromRepoName(repo)
        const alias = (aliases[repo] ?? '').trim()
        if (alias) {
          aliasesPayload[repo] = alias
          aliasesPayload[key] = alias
        }
        const br = (branches[repo] ?? branchFromFile(name) ?? '').trim()
        if (br) {
          branchesPayload[repo] = br
          branchesPayload[key] = br
        }
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
      // 自动打开覆盖：若存在相同 projectKey
      const keys = fileList.map(f => projectKeyFromFile(f.name))
      const hasDup = new Set(keys).size !== keys.length
      const finalOverwrite = overwrite || hasDup
      const res = await post<any>('/index', { bundles, ownersJson, overwrite: finalOverwrite, aliases: aliasesPayload, branches: branchesPayload })
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
      <Space align="center">
        <Typography.Text>同名覆盖</Typography.Text>
        <Switch checked={overwrite} onChange={setOverwrite} />
      </Space>
      <Upload.Dragger
        multiple
        fileList={fileList}
        beforeUpload={() => false}
        onChange={info => {
          setFileList(info.fileList)
          // 初始化新文件的别名（默认使用推导出的 repo 名）
          setAliases(prev => {
            const next = { ...prev }
            for (const f of info.fileList) {
              const repo = repoNameFromFile(f.name)
              if (!next.hasOwnProperty(repo)) next[repo] = repo
            }
            // 清理已移除文件的别名键
            const keep = new Set(info.fileList.map(f => repoNameFromFile(f.name)))
            for (const k of Object.keys(next)) {
              if (!keep.has(k)) delete (next as any)[k]
            }
            return next
          })
          // 初始化/清理分支
          setBranches(prev => {
            const next = { ...prev }
            for (const f of info.fileList) {
              const repo = repoNameFromFile(f.name)
              if (!next.hasOwnProperty(repo)) {
                const br = branchFromFile(f.name)
                if (br) next[repo] = br
              }
            }
            const keep = new Set(info.fileList.map(f => repoNameFromFile(f.name)))
            for (const k of Object.keys(next)) {
              if (!keep.has(k)) delete (next as any)[k]
            }
            return next
          })
          // 若存在相同 projectKey，自动开启覆盖
          const keys = info.fileList.map(f => projectKeyFromFile(f.name))
          const hasDup = new Set(keys).size !== keys.length
          if (hasDup) setOverwrite(true)
        }}
        accept=".zip"
      >
        <p className="ant-upload-drag-icon">📦</p>
        <p className="ant-upload-text">点击或拖拽 ZIP 包到此处</p>
        <p className="ant-upload-hint">支持多个 ZIP；文件不会自动上传，提交时一并发送到后端</p>
      </Upload.Dragger>
      {fileList.length > 0 && (
        <>
          <Divider orientation="left">为每个 ZIP 设置别名（用于诊断选择列表）</Divider>
          <Space direction="vertical" style={{ width: '100%' }}>
            {fileList.map(f => {
              const repo = repoNameFromFile(f.name)
              return (
                <Space key={f.uid} style={{ width: '100%' }}>
                  <Typography.Text type="secondary" style={{ minWidth: 280 }}>
                    {f.name}
                  </Typography.Text>
                  <Input
                    placeholder={`别名（默认：${repo})`}
                    style={{ maxWidth: 360 }}
                    value={aliases[repo] ?? ''}
                    onChange={e =>
                      setAliases(prev => ({ ...prev, [repo]: e.target.value }))
                    }
                  />
                  <Input
                    placeholder={`分支（可选，如：main）`}
                    style={{ maxWidth: 240 }}
                    value={branches[repo] ?? ''}
                    onChange={e => setBranches(prev => ({ ...prev, [repo]: e.target.value }))}
                  />
                </Space>
              )
            })}
          </Space>
        </>
      )}
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
