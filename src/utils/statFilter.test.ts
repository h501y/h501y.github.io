import { describe, expect, it } from 'vitest'
import type { Card } from '../types'
import { matchesStatFilter } from './statFilter'

function makeCard(overrides: Partial<Card>): Card {
  return {
    name: 'Test Card',
    edition: 'Test Set',
    language: 'English',
    rarity: 'common',
    quantity: 1,
    ...overrides
  }
}

describe('matchesStatFilter', () => {
  it('applies cmc operators correctly', () => {
    const card = makeCard({ cmc: 4 })

    expect(matchesStatFilter(card, 'cmc', '>=', '3')).toBe(true)
    expect(matchesStatFilter(card, 'cmc', '<', '3')).toBe(false)
  })

  it('applies numeric operators to power/toughness', () => {
    const card = makeCard({ power: '5', toughness: '2' })

    expect(matchesStatFilter(card, 'power', '>', '3')).toBe(true)
    expect(matchesStatFilter(card, 'power', '<=', '4')).toBe(false)
    expect(matchesStatFilter(card, 'toughness', '<=', '2')).toBe(true)
  })

  it('supports exact symbolic comparisons for non numeric stats', () => {
    const card = makeCard({ power: '*', toughness: '*' })

    expect(matchesStatFilter(card, 'power', '=', '*')).toBe(true)
    expect(matchesStatFilter(card, 'power', '>', '1')).toBe(false)
  })
})