import { describe, it, expect, vi, beforeEach } from 'vitest'
import { post, get, API_BASE } from '../api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('API Utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('get()', () => {
    it('应该成功发起 GET 请求并返回 JSON', async () => {
      const mockData = { success: true, data: 'test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await get('/test')

      expect(mockFetch).toHaveBeenCalledWith(API_BASE + '/test')
      expect(result).toEqual(mockData)
    })

    it('应该在请求失败时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Error message',
      })

      await expect(get('/test')).rejects.toThrow('Error message')
    })
  })

  describe('post()', () => {
    it('应该成功发起 POST 请求并返回 JSON', async () => {
      const payload = { name: 'test' }
      const mockData = { success: true, data: 'test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await post('/test', payload)

      expect(mockFetch).toHaveBeenCalledWith(API_BASE + '/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      expect(result).toEqual(mockData)
    })

    it('应该在请求失败时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Error message',
      })

      await expect(post('/test', {})).rejects.toThrow('Error message')
    })

    it('应该处理空 body', async () => {
      const mockData = { success: true }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      await post('/test', null)

      expect(mockFetch).toHaveBeenCalledWith(API_BASE + '/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    })
  })

  describe('API_BASE', () => {
    it('应该从环境变量读取或使用默认值', () => {
      expect(typeof API_BASE).toBe('string')
    })
  })
})
