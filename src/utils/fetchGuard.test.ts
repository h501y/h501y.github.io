import { describe, expect, it } from 'vitest'
import { isBlockedFetchUrl, resolveFetchUrl } from './fetchGuard'

describe('fetchGuard', () => {
  it('blocks api.scryfall.com fetch urls', () => {
    expect(isBlockedFetchUrl('https://api.scryfall.com/cards/named?fuzzy=lightning+bolt')).toBe(true)
  })

  it('does not block any gist dataset urls', () => {
    expect(
      isBlockedFetchUrl('https://gist.githubusercontent.com/someuser/abc123def456/raw/magic-collection.json')
    ).toBe(false)
  })

  it('does not block card image hosts', () => {
    expect(
      isBlockedFetchUrl('https://cards.scryfall.io/normal/front/0/0/00000000-0000-0000-0000-000000000000.jpg')
    ).toBe(false)
  })

  it('resolves relative urls against provided base', () => {
    const resolved = resolveFetchUrl('/collection-data.json', 'https://example.test')
    expect(resolved?.toString()).toBe('https://example.test/collection-data.json')
    expect(isBlockedFetchUrl('/collection-data.json', 'https://example.test')).toBe(false)
  })
})

