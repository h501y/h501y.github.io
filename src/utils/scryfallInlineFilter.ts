import type { Card } from '../types'

export interface ScryfallInlineFilterResult {
  cards: Card[]
  unsupportedFields: string[]
  appliedLocalTokenCount: number
}

function tokenize(query: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quoteChar: '"' | "'" | null = null

  for (let i = 0; i < query.length; i++) {
    const char = query[i]

    if (char === '"' || char === "'") {
      if (quoteChar === null) {
        quoteChar = char
      } else if (quoteChar === char) {
        quoteChar = null
      }
      current += char
      continue
    }

    if (char === ' ' && quoteChar === null) {
      if (current.trim()) {
        tokens.push(current.trim())
        current = ''
      }
      continue
    }

    current += char
  }

  if (current.trim()) {
    tokens.push(current.trim())
  }

  return tokens
}

function parseJsonArray(value: string | undefined): string[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => entry.toLowerCase())
  } catch {
    return []
  }
}

function getCardColors(card: Card): string[] {
  if (Array.isArray(card.parsed_colors)) {
    return card.parsed_colors.map((c) => c.toLowerCase())
  }
  return parseJsonArray(card.colors)
}

function hasFinish(card: Card, finish: 'foil' | 'nonfoil'): boolean {
  return parseJsonArray(card.finishes).includes(finish)
}

function parseToken(token: string): { field: string; operator: string; value: string } | null {
  const match = token.match(/^([a-zA-Z_]+)(:|>=|<=|>|<)(.+)$/)
  if (!match) return null

  const [, rawField, operator, rawValue] = match
  return {
    field: rawField.toLowerCase(),
    operator,
    value: rawValue.replace(/^["']|["']$/g, '')
  }
}

export function applyScryfallInlineFilters(cards: Card[], query: string): ScryfallInlineFilterResult {
  const unsupportedFields = new Set<string>()
  let filtered = [...cards]
  let appliedLocalTokenCount = 0

  if (!query.trim()) {
    return { cards: filtered, unsupportedFields: [], appliedLocalTokenCount: 0 }
  }

  const tokens = tokenize(query)

  for (const token of tokens) {
    const parsed = parseToken(token)
    if (!parsed) continue

    const { field, operator, value } = parsed
    if (operator !== ':') {
      continue
    }

    if (field === 'is') {
      const flags = value.toLowerCase().split(/[,\s]+/).filter(Boolean)

      for (const flag of flags) {
        if (flag === 'promo') {
          filtered = filtered.filter((card) => card.promo === true)
          appliedLocalTokenCount++
          continue
        }

        if (flag === 'foil') {
          filtered = filtered.filter((card) => hasFinish(card, 'foil'))
          appliedLocalTokenCount++
          continue
        }

        if (flag === 'nonfoil') {
          filtered = filtered.filter((card) => hasFinish(card, 'nonfoil'))
          appliedLocalTokenCount++
          continue
        }

        if (flag === 'legendary') {
          filtered = filtered.filter((card) => card.type_line?.toLowerCase().includes('legendary'))
          appliedLocalTokenCount++
          continue
        }

        if (flag === 'multicolor') {
          filtered = filtered.filter((card) => getCardColors(card).length > 1)
          appliedLocalTokenCount++
          continue
        }

        if (flag === 'monocolor') {
          filtered = filtered.filter((card) => getCardColors(card).length === 1)
          appliedLocalTokenCount++
          continue
        }

        if (flag === 'colorless') {
          filtered = filtered.filter((card) => getCardColors(card).length === 0)
          appliedLocalTokenCount++
          continue
        }

        unsupportedFields.add(`is:${flag}`)
      }

      continue
    }

    if (field === 'art') {
      unsupportedFields.add('art')
      continue
    }

    if (field === 'game' || field === 'lang' || field === 'frame' || field === 'border') {
      unsupportedFields.add(field)
    }
  }

  return {
    cards: filtered,
    unsupportedFields: Array.from(unsupportedFields),
    appliedLocalTokenCount
  }
}

