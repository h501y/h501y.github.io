import type { Card, CardSet, CardTag, WebCollectionData } from '../types'

function parseStringArray(raw: string | undefined): string[] {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((value): value is string => typeof value === 'string')
  } catch {
    return []
  }
}

function parseTags(raw: string | undefined): CardTag[] {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((value): value is Record<string, unknown> => typeof value === 'object' && value !== null)
      .map((tag) => {
        const name = typeof tag.name === 'string' ? tag.name : ''
        const colorIndex = typeof tag.colorIndex === 'number' ? tag.colorIndex : undefined
        return { name, colorIndex }
      })
      .filter((tag) => tag.name.length > 0)
  } catch {
    return []
  }
}

function normalizeCard(card: Card): Card {
  const normalizedEditionCode =
    typeof card.edition_code === 'string' ? card.edition_code.toLowerCase() : card.edition_code

  return {
    ...card,
    edition_code: normalizedEditionCode,
    parsed_colors: parseStringArray(card.colors),
    parsed_color_identity: parseStringArray(card.color_identity),
    parsed_tags: parseTags(card.tags)
  }
}

function normalizeSets(sets: CardSet[]): CardSet[] {
  const deduped = new Map<string, CardSet>()

  for (const set of sets) {
    if (typeof set.set_code !== 'string') {
      continue
    }

    const key = set.set_code.toLowerCase()
    if (!key) {
      continue
    }

    if (!deduped.has(key)) {
      deduped.set(key, {
        set_code: key,
        set_name: set.set_name || key.toUpperCase(),
        released_at: set.released_at
      })
      continue
    }

    const existing = deduped.get(key)!
    if (!existing.released_at && set.released_at) {
      existing.released_at = set.released_at
    }
    if ((!existing.set_name || existing.set_name.trim().length === 0) && set.set_name) {
      existing.set_name = set.set_name
    }
  }

  return Array.from(deduped.values())
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    if (typeof value !== 'string') {
      continue
    }

    const trimmed = value.trim()
    if (!trimmed) {
      continue
    }

    if (seen.has(trimmed)) {
      continue
    }

    seen.add(trimmed)
    result.push(trimmed)
  }

  return result
}

export function normalizeCollectionData(data: WebCollectionData): WebCollectionData {
  const validCards = (data.cards ?? []).filter((card) => {
    if (!card.name || typeof card.name !== 'string' || card.name.trim().length === 0) {
      console.warn('Skipping card with missing name:', card)
      return false
    }
    return true
  })

  return {
    ...data,
    cards: validCards.map(normalizeCard),
    sets: normalizeSets(data.sets ?? []),
    tags: dedupeStrings(data.tags ?? [])
  }
}
