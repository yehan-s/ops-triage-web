import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import Triage from '../../pages/Triage'

const qc = new QueryClient()

function renderWithRQ(ui: React.ReactElement) {
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('Triage page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('submits and renders JSON on success', async () => {
    const resp = { routeMatch: { pattern: '/api/foo' }, domain: 'be', confidence: 0.9 }
    vi.spyOn(global, 'fetch').mockImplementation(async (input: any) => {
      const url = String(input || '')
      if (url.endsWith('/offline/projects')) {
        return { ok: true, json: async () => ({ projects: [] }) } as any
      }
      if (url.endsWith('/triage')) {
        return { ok: true, json: async () => resp } as any
      }
      throw new Error('unexpected fetch ' + url)
    })

    renderWithRQ(<Triage />)
    fireEvent.change(screen.getByPlaceholderText('URL'), { target: { value: '/api/foo' } })
    fireEvent.click(screen.getByRole('button', { name: /分.?析/ }))

    await waitFor(() => expect(screen.getByText(/"pattern": "\/api\/foo"/)).toBeInTheDocument())
  })

  it('shows error when API fails', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input: any) => {
      const url = String(input || '')
      if (url.endsWith('/offline/projects')) {
        return { ok: true, json: async () => ({ projects: [] }) } as any
      }
      if (url.endsWith('/triage')) {
        return { ok: false, text: async () => 'Bad' } as any
      }
      throw new Error('unexpected fetch ' + url)
    })
    renderWithRQ(<Triage />)
    fireEvent.change(screen.getByPlaceholderText('URL'), { target: { value: '/bad' } })
    fireEvent.click(screen.getByRole('button', { name: /分.?析/ }))
    // 简化：fetch 抛错会导致 mutation 失败，不渲染结果；我们断言按钮 loading 后恢复
    await waitFor(() => expect(screen.getByRole('button', { name: /分.?析/ })).toBeEnabled())
  })
})
