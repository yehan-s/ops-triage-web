export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''

export async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body || {})
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
