import type { WebCollectionData } from '../types'

const BASE_CACHE_KEY = 'collectionDataCache'
const BASE_TIMESTAMP_KEY = 'collectionDataCacheTimestamp'

function dataCacheKey(gistId?: string): string {
  return gistId ? `${BASE_CACHE_KEY}_${gistId}` : BASE_CACHE_KEY
}

function cacheTimestampKey(gistId?: string): string {
  return gistId ? `${BASE_TIMESTAMP_KEY}_${gistId}` : BASE_TIMESTAMP_KEY
}

function getStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage
    return typeof storage === 'undefined' ? null : storage
  } catch {
    return null
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isWebCollectionData(value: unknown): value is WebCollectionData {
  if (!isObject(value)) return false
  if (!Array.isArray(value.cards)) return false
  if (!Array.isArray(value.sets)) return false
  if (!Array.isArray(value.tags)) return false
  if (!isObject(value.stats)) return false
  return typeof value.version === 'string' && typeof value.exported_at === 'string'
}

export function saveCollectionDataCache(data: WebCollectionData, gistId?: string): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(dataCacheKey(gistId), JSON.stringify(data))
    storage.setItem(cacheTimestampKey(gistId), String(Date.now()))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Failed to save collection cache: localStorage quota exceeded.', error)
    } else {
      console.warn('Failed to save collection cache to localStorage.', error)
    }
  }
}

export function loadCollectionDataCache(gistId?: string): WebCollectionData | null {
  const storage = getStorage()
  if (!storage) return null

  try {
    const raw = storage.getItem(dataCacheKey(gistId))
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    const candidate = isObject(parsed) && isObject(parsed.data) ? parsed.data : parsed

    return isWebCollectionData(candidate) ? candidate : null
  } catch (error) {
    console.warn('Failed to read collection cache from localStorage.', error)
    return null
  }
}
