import { describe, expect, it } from 'vitest'
import type { Card } from '../types'
import {
  filterAndSortCards,
  normalizeForSearch,
  rarityColor,
  scryfallUrlFor
} from './searchCards'

function makeCard(overrides: Partial<Card>): Card {
  return {
    name: 'Card',
    edition: 'Set',
    language: 'English',
    rarity: 'C',
    quantity: 1,
    ...overrides
  }
}

describe('normalizeForSearch', () => {
  it('strips diacritics and lowercases', () => {
    expect(normalizeForSearch('Ajāni')).toBe('ajani')
    expect(normalizeForSearch('Lim-Dûl')).toBe('lim-dul')
    expect(normalizeForSearch('Sénéchal')).toBe('senechal')
  })

  it('folds Latin Extended ligatures atomically', () => {
    expect(normalizeForSearch('Æther Vial')).toBe('aether vial')
    expect(normalizeForSearch('Œuf')).toBe('oeuf')
    expect(normalizeForSearch('Strøm')).toBe('strom')
    expect(normalizeForSearch('Großherzog')).toBe('grossherzog')
  })

  it('returns empty string for empty/null inputs', () => {
    expect(normalizeForSearch('')).toBe('')
  })
})

describe('filterAndSortCards', () => {
  const cards: Card[] = [
    makeCard({ name: 'Lightning Bolt', quantity: 4, rarity: 'C' }),
    makeCard({ name: 'Ajani, Caller of the Pride', quantity: 1, rarity: 'M' }),
    makeCard({ name: 'Counterspell', italian_name: 'Controincantesimo', quantity: 2, rarity: 'C' }),
    makeCard({ name: 'Forest', quantity: 12, rarity: 'C' })
  ]

  it('returns all cards sorted by name asc by default', () => {
    const result = filterAndSortCards(cards, '', 'name', 'asc')
    expect(result.map((c) => c.name)).toEqual([
      'Ajani, Caller of the Pride',
      'Counterspell',
      'Forest',
      'Lightning Bolt'
    ])
  })

  it('filters by english name', () => {
    const result = filterAndSortCards(cards, 'bolt', 'name', 'asc')
    expect(result.map((c) => c.name)).toEqual(['Lightning Bolt'])
  })

  it('filters by italian name', () => {
    const result = filterAndSortCards(cards, 'controincantesimo', 'name', 'asc')
    expect(result.map((c) => c.name)).toEqual(['Counterspell'])
  })

  it('filters accent-insensitive', () => {
    const result = filterAndSortCards(cards, 'ajani', 'name', 'asc')
    expect(result.map((c) => c.name)).toEqual(['Ajani, Caller of the Pride'])
  })

  it('sorts by quantity desc', () => {
    const result = filterAndSortCards(cards, '', 'quantity', 'desc')
    expect(result.map((c) => c.quantity)).toEqual([12, 4, 2, 1])
  })

  it('sorts by rarity desc (mythic first)', () => {
    const result = filterAndSortCards(cards, '', 'rarity', 'desc')
    expect(result[0].rarity).toBe('M')
  })

  it('breaks rarity ties by name asc', () => {
    const result = filterAndSortCards(cards, '', 'rarity', 'asc')
    // Commons first; among commons (C), name asc
    const commons = result.filter((c) => c.rarity === 'C').map((c) => c.name)
    expect(commons).toEqual(['Counterspell', 'Forest', 'Lightning Bolt'])
  })
})

describe('scryfallUrlFor', () => {
  it('builds canonical URL when set_code + collector_number are present', () => {
    const url = scryfallUrlFor(
      makeCard({ name: 'Lightning Bolt', edition_code: 'm10', collector_number: '146', language: 'English' })
    )
    expect(url).toBe('https://scryfall.com/card/m10/146/en')
  })

  it('uses /it language suffix for Italian printings', () => {
    const url = scryfallUrlFor(
      makeCard({ name: 'Fulmine', edition_code: 'm10', collector_number: '146', language: 'Italian' })
    )
    expect(url).toBe('https://scryfall.com/card/m10/146/it')
  })

  it('falls back to a search URL when set or collector number is missing', () => {
    const url = scryfallUrlFor(makeCard({ name: 'Some Card' }))
    expect(url).toBe('https://scryfall.com/search?q=!%22Some%20Card%22')
  })
})

describe('rarityColor', () => {
  it('returns distinct hexes per rarity tier', () => {
    const colors = new Set([
      rarityColor('M'),
      rarityColor('R'),
      rarityColor('U'),
      rarityColor('C')
    ])
    expect(colors.size).toBe(4)
  })

  it('returns the fallback color for unknown rarities', () => {
    expect(rarityColor(undefined)).toBe('#52525b')
    expect(rarityColor('???')).toBe('#52525b')
  })
})
