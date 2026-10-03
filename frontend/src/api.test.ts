import { describe, expect, it, vi } from 'vitest'
import { calculate } from './api'

function mockFetch(status: number, body: string) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(body, { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('calculate', () => {
  it('returns the result and sends a POST with both numbers', async () => {
    const fetchMock = mockFetch(200, '{"result":5}')

    await expect(calculate('add', 2, 3)).resolves.toBe(5)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/add',
      expect.objectContaining({ method: 'POST', body: '{"a":2,"b":3}' }),
    )
  })

  it('omits b when it is not provided', async () => {
    const fetchMock = mockFetch(200, '{"result":3}')

    await calculate('sqrt', 9)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sqrt',
      expect.objectContaining({ body: '{"a":9}' }),
    )
  })

  it('uses the error message from the backend', async () => {
    mockFetch(422, '{"error":"division by zero"}')
    await expect(calculate('divide', 1, 0)).rejects.toThrow('division by zero')
  })

  it('falls back to the status when the error body is not JSON', async () => {
    mockFetch(500, 'Internal Server Error')
    await expect(calculate('add', 1, 2)).rejects.toThrow('Request failed with status 500.')
  })

  it('reports network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(calculate('add', 1, 2)).rejects.toThrow('Could not reach the server')
  })

  it('rejects a success response without a numeric result', async () => {
    mockFetch(200, '{"value":5}')
    await expect(calculate('add', 1, 2)).rejects.toThrow('Unexpected response from the server.')
  })
})