/**
 * Dev: `npm run dev` — same origin `/api` (handled by Vite plugin + Express).
 * Prod: Vercel `api/` or `VITE_API_BASE_URL`.
 */
function resolveApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return `${fromEnv.replace(/\/$/, '')}${normalized}`
  }
  if (typeof window === 'undefined') {
    return normalized
  }
  return new URL(normalized, window.location.origin).href
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveApiUrl(path)
  let res: Response
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    throw new Error(
      `Network error (${reason}). ` +
        (import.meta.env.DEV
          ? 'Run npm run dev (not preview). Check .env.local has MONGODB_URI.'
          : 'Add MONGODB_URI, JWT_SECRET, ACCESS_CODE_SECRET on Vercel.'),
    )
  }

  const data = (await res.json().catch(() => ({}))) as T & { error?: string; detail?: string }
  if (!res.ok) {
    const err = (data as { error?: string; detail?: string }).error || res.statusText || 'Request failed'
    const detail = (data as { detail?: string }).detail
    throw new Error(detail ? `${err}: ${detail}` : err)
  }
  return data as T
}
