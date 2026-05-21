import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WebCollectionData } from '../types'
import { normalizeCollectionData } from '../utils/normalizeCollectionData'
import { isCacheStale, isDatasetStale, loadCollectionDataCache, saveCollectionDataCache } from '../utils/collectionDataCache'
import { guardedFetch } from '../utils/fetchGuard'

const VERSION_STORAGE_KEY = 'collectionVersion'
const FETCH_TIMEOUT_MS = 6000

export type CollectionDataSource = 'gist' | 'fallback' | 'cache'

export interface UseCollectionDataResult {
  data: WebCollectionData | null
  isLoading: boolean
  error: string | null
  dataSource: CollectionDataSource | null
  isDataStale: boolean
  reloadData: () => Promise<void>
}

const SAVED_GIST_ID_KEY = 'gist_id'

function saveGistId(id: string): void {
  try { localStorage.setItem(SAVED_GIST_ID_KEY, id) } catch { /* ignore */ }
}

function resolveGistId(): string | null {
  if (typeof window === 'undefined') return null
  // 1. URL param → use it and persist for future visits
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('gist')?.trim() || null
  if (fromUrl) {
    saveGistId(fromUrl)
    return fromUrl
  }
  // 2. Saved in localStorage (same key as Desktop/Mobile apps)
  try { return localStorage.getItem(SAVED_GIST_ID_KEY) || null } catch { return null }
}

function buildGistRawUrl(gistId: string): string {
  // GitHub serves raw content via this path; the redirect handles the
  // owner lookup so we only need the gist ID.
  return `https://gist.githubusercontent.com/${gistId}/raw/magic-collection.json`
}

function buildRequestUrl(url: string): string {
  if (!url.includes('gist.githubusercontent.com')) {
    return url
  }
  // Force cache-busting to avoid stale CDN/browser responses.
  const requestUrl = new URL(url)
  requestUrl.searchParams.set('_ts', String(Date.now()))
  return requestUrl.toString()
}

export function useCollectionData(): UseCollectionDataResult {
  const gistId = useMemo(() => resolveGistId(), [])
  const gistUrl = useMemo(() => (gistId ? buildGistRawUrl(gistId) : null), [gistId])

  const [data, setData] = useState<WebCollectionData | null>(null)
  const [isLoading, setIsLoading] = useState(gistUrl !== null)
  const [error, setError] = useState<string | null>(
    gistId === null ? 'no-gist-configured' : null
  )
  const [dataSource, setDataSource] = useState<CollectionDataSource | null>(null)
  const [isDataStale, setIsDataStale] = useState(false)
  const dataSourceRef = useRef<CollectionDataSource | null>(null)

  const loadData = useCallback(async (externalSignal?: AbortSignal) => {
    if (!gistUrl || !gistId) {
      setError('no-gist-configured')
      setIsLoading(false)
      return
    }

    async function fetchCollection(url: string): Promise<WebCollectionData> {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

      if (externalSignal) {
        externalSignal.addEventListener('abort', () => controller.abort(), { once: true })
      }

      try {
        const requestUrl = buildRequestUrl(url)
        const response = await guardedFetch(requestUrl, { cache: 'no-store', signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status}`)
        }
        return response.json() as Promise<WebCollectionData>
      } finally {
        clearTimeout(timeoutId)
      }
    }

    function persistVersion(json: WebCollectionData) {
      const cacheVersion = json.cacheVersion || json.exported_at || json.version
      try {
        const lastVersion = localStorage.getItem(VERSION_STORAGE_KEY)
        if (lastVersion !== String(cacheVersion)) {
          if (import.meta.env.DEV) console.log(`New collection version detected: ${cacheVersion} (was: ${lastVersion || 'none'})`)
          localStorage.setItem(VERSION_STORAGE_KEY, String(cacheVersion))
        } else {
          if (import.meta.env.DEV) console.log(`Collection up to date (v${cacheVersion})`)
        }
      } catch {
        console.warn('Could not persist collection version to localStorage')
      }
    }

    function applyLoadedData(rawData: WebCollectionData, source: CollectionDataSource) {
      const json = normalizeCollectionData(rawData)
      persistVersion(json)
      if (source === 'gist') {
        saveCollectionDataCache(json, gistId ?? undefined)
      }
      const staleByDatasetAge = isDatasetStale(json)
      const staleByCacheAge = source === 'cache' && isCacheStale(gistId ?? undefined)
      if (import.meta.env.DEV) console.log(`Loaded ${json.cards?.length || 0} cards from ${source}`)
      if (import.meta.env.DEV && json.lastUpdated) {
        console.log(`Last updated: ${json.lastUpdated}`)
      }
      setData(json)
      setDataSource(source)
      dataSourceRef.current = source
      setIsDataStale(staleByDatasetAge || staleByCacheAge)
      setError(null)
    }

    const hadDataBeforeLoad = dataSourceRef.current !== null
    const cachedData = loadCollectionDataCache(gistId ?? undefined)

    try {
      if (!hadDataBeforeLoad) {
        if (cachedData) {
          // Render cached data immediately, then revalidate from Gist in background.
          applyLoadedData(cachedData, 'cache')
          setIsLoading(false)
        } else {
          setIsLoading(true)
        }
      }

      const json = await fetchCollection(gistUrl)
      applyLoadedData(json, 'gist')
    } catch (gistError) {
      if (gistError instanceof Error && gistError.name === 'AbortError') return
      console.warn('Gist fetch failed, trying local cache.', gistError)

      if (cachedData && !hadDataBeforeLoad) {
        applyLoadedData(cachedData, 'cache')
      } else if (!hadDataBeforeLoad) {
        const errorMessage = gistError instanceof Error ? gistError.message : 'Unknown error'
        console.error('Failed to load collection:', errorMessage)
        setError(errorMessage)
        setDataSource(null)
        dataSourceRef.current = null
      }
    } finally {
      setIsLoading(false)
    }
  }, [gistId, gistUrl])

  useEffect(() => {
    if (!gistUrl) return

    const controller = new AbortController()
    void loadData(controller.signal)

    let onlineController: AbortController | null = null
    const handleOnline = () => {
      if (dataSourceRef.current === 'cache' || dataSourceRef.current === 'fallback' || dataSourceRef.current === null) {
        if (import.meta.env.DEV) console.log('Network back online - reloading collection data.')
        onlineController?.abort()
        onlineController = new AbortController()
        void loadData(onlineController.signal)
      }
    }

    window.addEventListener('online', handleOnline)

    return () => {
      controller.abort()
      onlineController?.abort()
      window.removeEventListener('online', handleOnline)
    }
  }, [loadData, gistUrl])

  return {
    data,
    isLoading,
    error,
    dataSource,
    isDataStale,
    reloadData: () => loadData()
  }
}
