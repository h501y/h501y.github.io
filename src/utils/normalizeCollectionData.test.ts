import { describe, expect, it } from 'vitest'
import type { WebCollectionData } from '../types'
import { normalizeCollectionData } from './normalizeCollectionData'

function makeData(): WebCollectionData {
  return {
    version: '1.0.0',
    exported_at: '2026-03-08T00:00:00.000Z',
    stats: {
      total_cards: 2,
      unique_cards: 2,
      by_rarity: [
        { rarity: 'R', count: 1 },
        { rarity: 'C', count: 1 }
      ]
    },
    cards: [
      {
        id: 1,
        name: 'A',
        edition: 'Set A',
        edition_code: 'KLD',
        language: 'English',
        rarity: 'R',
        quantity: 1,
        colors: '["R","G"]',
        color_identity: '["R"]',
        tags: '[{"name":"tag-a","colorIndex":6}]'
      },
      {
        id: 2,
        name: 'B',
        edition: 'Set B',
        edition_code: 'm21',
        language: 'English',
        rarity: 'C',
        quantity: 1,
        colors: '{invalid',
        color_identity: 'null',
        tags: '{invalid'
      }
    ],
    sets: [
      { set_code: 'kld', set_name: 'Kaladesh' },
      { set_code: 'KLD', set_name: 'Kaladesh Duplicate' },
      { set_code: 'M21', set_name: 'Core 2021' }
    ],
    tags: ['tag-a', 'tag-a', 'tag-b']
  }
}

describe('normalizeCollectionData', () => {
  it('parses card json fields once and normalizes set codes', () => {
    const normalized = normalizeCollectionData(makeData())

    expect(normalized.cards[0].edition_code).toBe('kld')
    expect(normalized.cards[0].parsed_colors).toEqual(['R', 'G'])
    expect(normalized.cards[0].parsed_color_identity).toEqual(['R'])
    expect(normalized.cards[0].parsed_tags).toEqual([{ name: 'tag-a', colorIndex: 6 }])

    expect(normalized.cards[1].parsed_colors).toEqual([])
    expect(normalized.cards[1].parsed_color_identity).toEqual([])
    expect(normalized.cards[1].parsed_tags).toEqual([])
  })

  it('deduplicates sets case-insensitively', () => {
    const normalized = normalizeCollectionData(makeData())

    expect(normalized.sets).toHaveLength(2)
    expect(normalized.sets.map((set) => set.set_code)).toEqual(['kld', 'm21'])
  })

  it('deduplicates root tags while preserving order', () => {
    const normalized = normalizeCollectionData(makeData())
    expect(normalized.tags).toEqual(['tag-a', 'tag-b'])
  })
})
