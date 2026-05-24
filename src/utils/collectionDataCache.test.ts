import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { WebCollectionData } from '../types'
import { loadCollectionDataCache, saveCollectionDataCache } from './collectionDataCache'

class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}

function makeData(): WebCollectionData {
  return {
    version: '1.0.0',
    exported_at: '2026-03-08T00:00:00.000Z',
    stats: {
      total_cards: 1,
      unique_cards: 1,
      by_rarity: [{ rarity: 'rare', count: 1 }]
    },
    cards: [
      {
        id: 1,
        name: 'Lightning Bolt',
        edition: 'Magic 2010',
        language: 'English',
        rarity: 'common',
        quantity: 4
      }
    ],
    sets: [{ set_code: 'm10', set_name: 'Magic 2010' }],
    tags: ['burn']
  }
}

const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

function setLocalStorage(value?: Storage) {
  if (value) {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value
    })
    return
  }

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: undefined
  })
}

beforeEach(() => {
  setLocalStorage(new MemoryStorage())
})

afterEach(() => {
  setLocalStorage(undefined)
})

afterAll(() => {
  if (originalLocalStorage) {
    Object.defineProperty(globalThis, 'localStorage', originalLocalStorage)
  } else {
    delete (globalThis as { localStorage?: Storage }).localStorage
  }
})

describe('collectionDataCache', () => {
  it('saves and loads dataset from localStorage', () => {
    const data = makeData()
    saveCollectionDataCache(data)

    const cached = loadCollectionDataCache()
    expect(cached).toEqual(data)
  })

  it('namespaces cache by gist id', () => {
    const dataA = makeData()
    const dataB = { ...makeData(), version: '2.0.0' }

    saveCollectionDataCache(dataA, 'aaa')
    saveCollectionDataCache(dataB, 'bbb')

    expect(loadCollectionDataCache('aaa')).toEqual(dataA)
    expect(loadCollectionDataCache('bbb')).toEqual(dataB)
  })

  it('returns null for malformed cache data', () => {
    localStorage.setItem('collectionDataCache', '{"broken":true}')
    expect(loadCollectionDataCache()).toBeNull()
  })

  it('returns null when localStorage is unavailable', () => {
    setLocalStorage(undefined)
    expect(loadCollectionDataCache()).toBeNull()
    expect(() => saveCollectionDataCache(makeData())).not.toThrow()
  })
})
