const BLOCKED_FETCH_HOSTS = new Set(['api.scryfall.com'])

type FetchInput = Parameters<typeof fetch>[0]

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost'
}

function getInputUrl(input: FetchInput): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  if (typeof Request !== 'undefined' && input instanceof Request) return input.url
  return String(input)
}

export function resolveFetchUrl(input: FetchInput, baseUrl = getBaseUrl()): URL | null {
  try {
    return new URL(getInputUrl(input), baseUrl)
  } catch {
    return null
  }
}

export function isBlockedFetchUrl(input: FetchInput, baseUrl = getBaseUrl()): boolean {
  const url = resolveFetchUrl(input, baseUrl)
  if (!url) return false
  return BLOCKED_FETCH_HOSTS.has(url.hostname.toLowerCase())
}

export function guardedFetch(input: FetchInput, init?: RequestInit): Promise<Response> {
  if (isBlockedFetchUrl(input)) {
    const url = resolveFetchUrl(input)?.toString() ?? getInputUrl(input)
    const message = `Blocked fetch request to disallowed host: ${url}`
    console.warn(message)
    return Promise.reject(new Error(message))
  }
  return fetch(input, init)
}

declare global {
  interface Window {
    __magicFetchGuardInstalled__?: boolean
    __magicOriginalFetch__?: typeof fetch
  }
}

export function installFetchGuard(): void {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return
  if (window.__magicFetchGuardInstalled__) return

  const originalFetch = window.fetch.bind(window)
  window.__magicOriginalFetch__ = originalFetch
  window.__magicFetchGuardInstalled__ = true

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (isBlockedFetchUrl(input)) {
      const url = resolveFetchUrl(input)?.toString() ?? String(input)
      const message = `Blocked fetch request to disallowed host: ${url}`
      console.warn(message)
      return Promise.reject(new Error(message))
    }
    return originalFetch(input, init)
  }) as typeof window.fetch
}

