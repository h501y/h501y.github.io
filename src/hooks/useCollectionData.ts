import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WebCollectionData } from '../types'
import { normalizeCollectionData } from '../utils/normalizeCollectionData'
import { loadCollectionDataCache, saveCollectionDataCache } from '../utils/collectionDataCache'
import { guardedFetch } from '../utils/fetchGuard'

const FETCH_TIMEOUT_MS = 8000

// Hardcoded gist that holds the published collection. The mobile
// publisher writes to this exact gist. GitHub's raw URL requires the
// owner's username — passing just the gist id returns HTTP 400.
//
// `?gist=<id>` is honored as an override for testing, defaulting to
// the same owner. Use `?gist=<user>/<id>` to also override the owner.
const DEFAULT_GIST_OWNER = 'h501y'
const DEFAULT_GIST_ID = '4e0cccc091fe0b9570ca1c70aba90d26'

interface GistRef {
  owner: string
  id: string
}

function readGistFromQuery(): GistRef | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('gist')?.trim()
  if (!raw) return null
  if (raw.includes('/')) {
    const [owner, id] = raw.split('/', 2)
    if (owner && id) return { owner, id }
    return null
  }
  return { owner: DEFAULT_GIST_OWNER, id: raw }
}

export type CollectionDataSource = 'gist' | 'cache'

export interface UseCollectionDataResult {
  data: WebCollectionData | null
  isLoading: boolean
  error: string | null
  dataSource: CollectionDataSource | null
  reloadData: () => Promise<void>
}

function buildGistRawUrl(ref: GistRef): string {
  return `https://gist.githubusercontent.com/${ref.owner}/${ref.id}/raw/magic-collection.json`
}

// Network-first by design. The viewer must NEVER show a stale payload
// when the user has connectivity: every page open, tab focus, or online
// event triggers a fresh fetch from the gist with all intermediate
// caches bypassed (CDN, browser, ex-service-worker). The localStorage
// cache exists solely as an offline fallback — it is shown only when
// the network request itself fails.
export function useCollectionData(): UseCollectionDataResult {
  const gistRef = useMemo<GistRef>(
    () => readGistFromQuery() ?? { owner: DEFAULT_GIST_OWNER, id: DEFAULT_GIST_ID },
    []
  )
  const activeUrl = useMemo(() => buildGistRawUrl(gistRef), [gistRef])
  // Cache key is namespaced by id only — the owner is implicit (gist
  // ids are globally unique) and keeping the key short avoids breaking
  // existing localStorage entries when the owner string is added later.
  const cacheKey = gistRef.id

  const [data, setData] = useState<WebCollectionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<CollectionDataSource | null>(null)
  const inFlightController = useRef<AbortController | null>(null)
  const hasFreshDataRef = useRef(false)

  const loadData = useCallback(async (): Promise<void> => {
    // Cancel any previous fetch — only the latest call wins, so a quick
    // sequence of visibilitychange/focus events cannot leave a stale
    // response racing the current one.
    inFlightController.current?.abort()
    const controller = new AbortController()
    inFlightController.current = controller

    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    // Cache-busting query param defeats GitHub raw CDN caching. We
    // intentionally do NOT set Cache-Control / Pragma request headers:
    // they are not CORS-safelisted, so adding them would force a
    // preflight OPTIONS that gist.githubusercontent.com does not
    // accept (Failed to fetch). cache: 'no-store' + the unique _ts
    // param are sufficient to bypass every intermediate cache.
    const requestUrl = new URL(activeUrl)
    requestUrl.searchParams.set('_ts', String(Date.now()))

    try {
      const response = await guardedFetch(requestUrl.toString(), {
        cache: 'no-store',
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Gist fetch failed: ${response.status}`)
      }

      const rawJson = (await response.json()) as WebCollectionData
      const normalized = normalizeCollectionData(rawJson)

      if (controller.signal.aborted) return

      setData(normalized)
      setDataSource('gist')
      setError(null)
      hasFreshDataRef.current = true
      saveCollectionDataCache(normalized, cacheKey)
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') return

      // Network failure: fall back to cache ONLY if we have nothing
      // fresh on screen yet. If the user is already viewing a live
      // payload from a previous successful fetch in this session, keep
      // showing it rather than downgrading to a stale cache.
      if (hasFreshDataRef.current) {
        console.warn('Gist revalidation failed; keeping current live data.', fetchError)
        return
      }

      const cached = loadCollectionDataCache(cacheKey)
      if (cached) {
        setData(cached)
        setDataSource('cache')
        setError(null)
        console.warn('Gist fetch failed; serving offline cache.', fetchError)
        return
      }

      const message = fetchError instanceof Error ? fetchError.message : 'Errore di rete'
      setError(message)
      setDataSource(null)
    } finally {
      clearTimeout(timeoutId)
      if (inFlightController.current === controller) {
        inFlightController.current = null
      }
      setIsLoading(false)
    }
  }, [activeUrl, cacheKey])

  useEffect(() => {
    void loadData()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadData()
      }
    }

    const handleFocus = () => {
      void loadData()
    }

    const handleOnline = () => {
      void loadData()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('online', handleOnline)

    return () => {
      inFlightController.current?.abort()
      inFlightController.current = null
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
    }
  }, [loadData])

  return {
    data,
    isLoading,
    error,
    dataSource,
    reloadData: loadData
  }
}
