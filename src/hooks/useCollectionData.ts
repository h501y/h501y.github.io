import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WebCollectionData } from '../types'
import { normalizeCollectionData } from '../utils/normalizeCollectionData'
import { loadCollectionDataCache, saveCollectionDataCache } from '../utils/collectionDataCache'
import { guardedFetch } from '../utils/fetchGuard'

const FETCH_TIMEOUT_MS = 8000

// Hardcoded gist id that holds the published collection. The mobile
// publisher writes to this gist. `?gist=<id>` is honored as an override
// for testing only.
const DEFAULT_GIST_ID = '8a09b4a605cd230d3088a7e6eb2a558a'

function readGistIdFromQuery(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('gist')?.trim() || null
}

export type CollectionDataSource = 'gist' | 'cache'

export interface UseCollectionDataResult {
  data: WebCollectionData | null
  isLoading: boolean
  error: string | null
  dataSource: CollectionDataSource | null
  reloadData: () => Promise<void>
}

function buildGistRawUrl(gistId: string): string {
  return `https://gist.githubusercontent.com/${gistId}/raw/magic-collection.json`
}

// Network-first by design. The viewer must NEVER show a stale payload
// when the user has connectivity: every page open, tab focus, or online
// event triggers a fresh fetch from the gist with all intermediate
// caches bypassed (CDN, browser, ex-service-worker). The localStorage
// cache exists solely as an offline fallback — it is shown only when
// the network request itself fails.
export function useCollectionData(): UseCollectionDataResult {
  const gistId = useMemo(
    () => readGistIdFromQuery() ?? DEFAULT_GIST_ID,
    []
  )
  const activeUrl = useMemo(() => buildGistRawUrl(gistId), [gistId])

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

    // Cache-busting query param defeats GitHub raw CDN caching and any
    // intermediate browser cache that might ignore the headers below.
    const requestUrl = new URL(activeUrl)
    requestUrl.searchParams.set('_ts', String(Date.now()))

    try {
      const response = await guardedFetch(requestUrl.toString(), {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
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
      saveCollectionDataCache(normalized, gistId)
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

      const cached = loadCollectionDataCache(gistId)
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
  }, [activeUrl, gistId])

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
