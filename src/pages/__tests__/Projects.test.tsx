import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import Projects from '../../pages/Projects'

const qc = new QueryClient()
function renderWithRQ(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/git/projects']}>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Projects page', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('shows token status and lists projects on search', async () => {
    const fetchMock = vi.spyOn(global, 'fetch')
    // First call: GET /git/config
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ baseUrl: 'https://x', tokenPresent: true }),
    } as any)
    // After clicking 查询: POST /git/projects
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: [{ id: 1, path_with_namespace: 'a/b', default_branch: 'main' }],
      }),
    } as any)

    renderWithRQ(<Projects />)
    await screen.findByText(/后端Token：已配置/)
    fireEvent.change(screen.getByPlaceholderText('搜索'), { target: { value: 'a' } })
    fireEvent.click(screen.getByRole('button', { name: /查.?询/ }))
    await waitFor(() => expect(screen.getByText('a/b')).toBeInTheDocument())
  })
})
