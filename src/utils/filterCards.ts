import type { Card, CardTag, CollectionFilterValues, WebCollectionData } from '../types'
import { matchesStatFilter } from './statFilter'

function parseManaSymbols(cost: string): string[] {
  return Array.from(cost.toUpperCase().matchAll(/\{[^}]+\}/g), (m) => m[0])
}

function symbolMultiset(symbols: string[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const s of symbols) counts[s] = (counts[s] ?? 0) + 1
  return counts
}

function parseJsonArray(value: string | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

function parseTagArray(value: string | undefined): CardTag[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry))
      .map((entry) => ({
        name: typeof entry.name === 'string' ? entry.name : '',
        colorIndex: typeof entry.colorIndex === 'number' ? entry.colorIndex : undefined
      }))
      .filter((entry) => entry.name.length > 0)
  } catch {
    return []
  }
}

export function filterCards(
  data: WebCollectionData | null,
  filters: CollectionFilterValues
): Card[] {
  if (!data) {
    return []
  }

  const {
    nameFilter,
    textFilter,
    typeLineFilter,
    colorFilters,
    colorMode,
    colorIdentityFilters,
    manaCostFilter,
    manaCostExact,
    statType,
    statOperator,
    statValue,
    setFilter,
    tagFilter,
    rarityFilters,
    sortField,
    sortDirection
  } = filters

  let cards = [...data.cards]

  if (nameFilter) {
    const name = nameFilter.toLowerCase()
    cards = cards.filter((c) =>
      c.name.toLowerCase().includes(name) ||
      c.italian_name?.toLowerCase().includes(name)
    )
  }

  if (textFilter) {
    const text = textFilter.toLowerCase()
    cards = cards.filter((c) => c.oracle_text?.toLowerCase().includes(text))
  }

  if (typeLineFilter) {
    const typeTokens = typeLineFilter
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)

    if (typeTokens.length > 0) {
      const includeTokens = typeTokens.filter((t) => !t.startsWith('-'))
      const excludeTokens = typeTokens.filter((t) => t.startsWith('-')).map((t) => t.slice(1))

      cards = cards.filter((card) => {
        const typeLine = card.type_line?.toLowerCase() ?? ''
        return (
          includeTokens.every((t) => typeLine.includes(t)) &&
          excludeTokens.every((t) => !typeLine.includes(t))
        )
      })
    }
  }

  const activeColors = Object.entries(colorFilters)
    .filter(([, active]) => active)
    .map(([color]) => color)

  if (activeColors.length > 0) {
    cards = cards.filter((card) => {
      const cardColors = card.parsed_colors ?? parseJsonArray(card.colors)

      const isColorless = cardColors.length === 0
      const hasColorlessFilter = activeColors.includes('C')
      const queryColors = activeColors.filter((c) => c !== 'C')

      if (hasColorlessFilter && queryColors.length === 0) {
        return isColorless
      }

      if (!hasColorlessFilter && isColorless) {
        // In at_most mode the empty set is a subset of any color set → colorless always passes
        if (colorMode !== 'at_most') return false
      }

      if (hasColorlessFilter && isColorless) {
        return true
      }

      if (colorMode === 'exactly') {
        if (cardColors.length !== queryColors.length) return false
        return queryColors.every((c) => cardColors.includes(c)) &&
               cardColors.every((c) => queryColors.includes(c))
      }

      if (colorMode === 'including') {
        return queryColors.every((c) => cardColors.includes(c))
      }

      if (colorMode === 'at_most') {
        return cardColors.every((c) => queryColors.includes(c))
      }

      return true
    })
  }

  const activeIdentityColors = Object.entries(colorIdentityFilters)
    .filter(([, active]) => active)
    .map(([color]) => color)

  if (activeIdentityColors.length > 0) {
    cards = cards.filter((card) => {
      const cardIdentity = card.parsed_color_identity ?? parseJsonArray(card.color_identity)

      return cardIdentity.every((c) => activeIdentityColors.includes(c))
    })
  }

  if (manaCostFilter) {
    const querySymbols = parseManaSymbols(manaCostFilter)
    if (querySymbols.length > 0) {
      cards = cards.filter((c) => {
        if (!c.mana_cost) return false
        const cardSymbols = parseManaSymbols(c.mana_cost)
        if (manaCostExact) {
          if (cardSymbols.length !== querySymbols.length) return false
          const counts = symbolMultiset(cardSymbols)
          for (const s of querySymbols) {
            if (!counts[s]) return false
            counts[s]--
          }
          return true
        } else {
          const cardCounts = symbolMultiset(cardSymbols)
          for (const s of querySymbols) {
            if (!cardCounts[s]) return false
            cardCounts[s]--
          }
          return true
        }
      })
    }
  }

  if (statValue.trim()) {
    cards = cards.filter((card) => matchesStatFilter(card, statType, statOperator, statValue))
  }

  if (setFilter) {
    const normalizedSet = setFilter.toLowerCase()
    cards = cards.filter((c) => c.edition_code?.toLowerCase() === normalizedSet)
  }

  if (tagFilter) {
    cards = cards.filter((c) => {
      const tags = c.parsed_tags ?? parseTagArray(c.tags)
      return tags.some((t) => t.name.toLowerCase() === tagFilter.toLowerCase())
    })
  }

  const activeRarities = Object.entries(rarityFilters)
    .filter(([, active]) => active)
    .map(([rarity]) => rarity)

  if (activeRarities.length < 4) {
    cards = cards.filter((card) => {
      const r = card.rarity.toLowerCase()
      if (r === 'm' || r === 'mythic') return activeRarities.includes('mythic')
      if (r === 'r' || r === 'rare') return activeRarities.includes('rare')
      if (r === 'u' || r === 'uncommon') return activeRarities.includes('uncommon')
      if (r === 'c' || r === 'common') return activeRarities.includes('common')
      return true // rarità non-standard (special, timeshifted, bonus, ecc.) sempre incluse
    })
  }

  cards.sort((a, b) => {
    let aVal: string | number | undefined
    let bVal: string | number | undefined

    if (sortField === 'name') {
      aVal = a.name || ''
      bVal = b.name || ''
    } else if (sortField === 'type_line') {
      aVal = a.type_line || ''
      bVal = b.type_line || ''
    } else if (sortField === 'edition') {
      aVal = a.edition || ''
      bVal = b.edition || ''
    } else if (sortField === 'rarity') {
      const rarityOrder = { mythic: 0, m: 0, rare: 1, r: 1, uncommon: 2, u: 2, common: 3, c: 3 }
      aVal = rarityOrder[a.rarity.toLowerCase() as keyof typeof rarityOrder] ?? 4
      bVal = rarityOrder[b.rarity.toLowerCase() as keyof typeof rarityOrder] ?? 4
    } else if (sortField === 'cmc') {
      aVal = a.cmc ?? 0
      bVal = b.cmc ?? 0
    } else if (sortField === 'quantity') {
      aVal = a.quantity ?? 0
      bVal = b.quantity ?? 0
    }

    if (aVal === undefined || bVal === undefined) {
      return 0
    }

    let comparison = 0
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal)
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  return cards
}
