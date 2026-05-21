import { describe, expect, it } from 'vitest'
import { parseQuery } from './queryParser'

describe('parseQuery', () => {
  it('parses compact color tokens like c:rg', () => {
    const parsed = parseQuery('c:rg t:creature')

    expect(parsed.colors).toEqual(['R', 'G'])
    expect(parsed.type).toBe('creature')
  })

  it('parses compact identity tokens like id:uw', () => {
    const parsed = parseQuery('id:uw')

    expect(parsed.identity).toEqual(['U', 'W'])
  })

  it('keeps apostrophes in free text names', () => {
    const parsed = parseQuery("Urza's Ruinous Blast")

    expect(parsed.name).toBe("Urza's Ruinous Blast")
  })

  it('keeps apostrophes in fielded name filters', () => {
    const parsed = parseQuery("name:Urza's power>=3")

    expect(parsed.name).toBe("Urza's")
    expect(parsed.power).toEqual({ operator: '>=', value: 3 })
  })

  it('parses cmc numeric operators', () => {
    const parsed = parseQuery('cmc>=3')

    expect(parsed.cmc).toEqual({ operator: '>=', value: 3 })
  })
})