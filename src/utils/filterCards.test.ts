import { describe, expect, it } from 'vitest'
import type { CollectionFilterValues, WebCollectionData } from '../types'
import { filterCards } from './filterCards'

function makeDefaultFilters(): CollectionFilterValues {
  return {
    nameFilter: '',
    textFilter: '',
    typeLineFilter: '',
    colorFilters: { W: false, U: false, B: false, R: false, G: false, C: false },
    colorMode: 'including',
    colorIdentityFilters: { W: false, U: false, B: false, R: false, G: false, C: false },
    manaCostFilter: '',
    manaCostExact: true,
    statType: 'cmc',
    statOperator: '=',
    statValue: '',
    setFilter: '',
    tagFilter: '',
    rarityFilters: { mythic: true, rare: true, uncommon: true, common: true },
    sortField: 'name',
    sortDirection: 'asc'
  }
}

function makeData(): WebCollectionData {
  return {
    version: '1.0.0',
    exported_at: '2026-03-08T00:00:00.000Z',
    stats: {
      total_cards: 3,
      unique_cards: 3,
      by_rarity: [
        { rarity: 'C', count: 1 },
        { rarity: 'R', count: 2 }
      ]
    },
    cards: [
      {
        id: 1,
        name: 'A Card',
        edition: 'Set A',
        edition_code: 'kld',
        language: 'English',
        rarity: 'R',
        quantity: 1,
        power: '5',
        toughness: '3',
        tags: '[{"name":"tag-a"}]'
      },
      {
        id: 2,
        name: 'B Card',
        edition: 'Set B',
        edition_code: 'M21',
        language: 'English',
        rarity: 'C',
        quantity: 1,
        power: '2',
        toughness: '2',
        tags: '{invalid-json'
      },
      {
        id: 3,
        name: 'C Card',
        edition: 'Set C',
        edition_code: 'mh2',
        language: 'English',
        rarity: 'R',
        quantity: 1,
        power: '*',
        toughness: '*'
      }
    ],
    sets: [],
    tags: ['tag-a']
  }
}

describe('filterCards', () => {
  it('matches set filter case-insensitively', () => {
    const filters = makeDefaultFilters()
    filters.setFilter = 'KLD'

    const cards = filterCards(makeData(), filters)
    expect(cards).toHaveLength(1)
    expect(cards[0].name).toBe('A Card')
  })

  it('applies numeric stat operators through filter pipeline', () => {
    const filters = makeDefaultFilters()
    filters.statType = 'power'
    filters.statOperator = '>'
    filters.statValue = '3'

    const cards = filterCards(makeData(), filters)
    expect(cards.map((c) => c.name)).toEqual(['A Card'])
  })

  it('ignores invalid tag json without throwing', () => {
    const filters = makeDefaultFilters()
    filters.tagFilter = 'tag-a'

    const cards = filterCards(makeData(), filters)
    expect(cards.map((c) => c.name)).toEqual(['A Card'])
  })
})
