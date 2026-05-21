import type { WebCollectionData } from '../types'

const BASE_CACHE_KEY = 'collectionDataCache'
const BASE_TIMESTAMP_KEY = 'collectionDataCacheTimestamp'
const CACHE_STALE_MS = 7 * 24 * 60 * 60 * 1000 // 7 giorni

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

function parseDateTimestampMs(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const normalized = trimmed.replace(/(\.\d{3})\d+([+-]\d{2}:\d{2}|Z)$/i, '$1$2')
  const parsed = Date.parse(normalized)
  return Number.isNaN(parsed) ? null : parsed
}

function parseEpochTimestampMs(raw: unknown): number | null {
  const numericValue =
    typeof raw === 'number' ? raw :
    typeof raw === 'string' ? Number(raw) :
    NaN

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null
  }

  // Heuristic: UNIX seconds if 10-digit range, milliseconds if 13-digit range.
  if (numericValue > 1_000_000_000_000) {
    return Math.floor(numericValue)
  }
  if (numericValue > 1_000_000_000) {
    return Math.floor(numericValue * 1000)
  }
  return null
}

function resolveDatasetTimestampMs(data: WebCollectionData): number | null {
  if (typeof data.lastUpdated === 'string') {
    const parsed = parseDateTimestampMs(data.lastUpdated)
    if (parsed !== null) return parsed
  }

  if (typeof data.exported_at === 'string') {
    const parsed = parseDateTimestampMs(data.exported_at)
    if (parsed !== null) return parsed
  }

  return parseEpochTimestampMs(data.cacheVersion)
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

export function isDatasetStale(data: WebCollectionData, now = Date.now()): boolean {
  const timestampMs = resolveDatasetTimestampMs(data)
  if (timestampMs === null) {
    return false
  }

  return now - timestampMs > CACHE_STALE_MS
}

export function isCacheStale(gistId?: string): boolean {
  const storage = getStorage()
  if (!storage) return false

  const raw = storage.getItem(cacheTimestampKey(gistId))
  if (!raw) return true

  const savedAt = Number(raw)
  if (isNaN(savedAt)) return true

  return Date.now() - savedAt > CACHE_STALE_MS
}
