import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import Branches from '../../pages/Branches'
import { message } from 'antd'

const qc = new QueryClient()
function wrapper(ui: React.ReactElement) {
  const router = createMemoryRouter([{ path: '/git/branches/:projectId', element: ui }], {
    initialEntries: ['/git/branches/123'],
    future: { v7_startTransition: true, v7_relativeSplatPath: true },
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

describe('Branches page', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('lists branches and triggers API index', async () => {
    const fetchMock = vi.spyOn(global, 'fetch')
    // Initial: POST /git/branches
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ branches: [{ name: 'main', commit: { id: 'abc' } }] }),
    } as any)
    // API 索引
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ indexed: 1, owners: 0, files: 2 }),
    } as any)

    const msg = vi.spyOn(message, 'success').mockImplementation(() => undefined as any)

    wrapper(<Branches />)
    await screen.findByText('main')
    fireEvent.click(screen.getByRole('button', { name: 'API 索引' }))
    await waitFor(() => expect(msg).toHaveBeenCalled())
  })
})
