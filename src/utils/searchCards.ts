import type { Card } from '../types'

// Match the publisher's accent folding so a user typing "ajani" finds
// "Ajāni" (and vice versa). Latin Extended ligatures get atomic folds
// before NFD because NFD alone does not decompose them.
const LIGATURE_FOLDS: Record<string, string> = {
  'Æ': 'AE', 'æ': 'ae',
  'Œ': 'OE', 'œ': 'oe',
  'Ø': 'O', 'ø': 'o',
  'Ł': 'L', 'ł': 'l',
  'Đ': 'D', 'đ': 'd',
  'ß': 'ss'
}

export function normalizeForSearch(value: string): string {
  if (!value) return ''
  let folded = ''
  for (const ch of value) {
    folded += LIGATURE_FOLDS[ch] ?? ch
  }
  return folded
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export type SortField = 'name' | 'quantity' | 'rarity'
export type SortDirection = 'asc' | 'desc'

// Rarity weights for sorting — higher = rarer. Single-char codes come
// from the publisher (C/U/R/M/S/B) so we map both styles.
const RARITY_RANK: Record<string, number> = {
  c: 1, common: 1,
  u: 2, uncommon: 2,
  r: 3, rare: 3,
  m: 4, mythic: 4,
  s: 5, special: 5,
  b: 6, bonus: 6
}

function rarityWeight(rarity: string | undefined): number {
  if (!rarity) return 0
  return RARITY_RANK[rarity.toLowerCase()] ?? 0
}

export function filterAndSortCards(
  cards: readonly Card[],
  query: string,
  sortField: SortField,
  sortDirection: SortDirection
): Card[] {
  const normalizedQuery = normalizeForSearch(query)

  const filtered = normalizedQuery
    ? cards.filter((card) => {
        const haystack =
          normalizeForSearch(card.name) +
          ' ' +
          normalizeForSearch(card.italian_name ?? '')
        return haystack.includes(normalizedQuery)
      })
    : cards.slice()

  const dir = sortDirection === 'asc' ? 1 : -1
  filtered.sort((a, b) => {
    if (sortField === 'name') {
      return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }) * dir
    }
    if (sortField === 'quantity') {
      const diff = (a.quantity ?? 0) - (b.quantity ?? 0)
      if (diff !== 0) return diff * dir
      return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })
    }
    // rarity
    const diff = rarityWeight(a.rarity) - rarityWeight(b.rarity)
    if (diff !== 0) return diff * dir
    return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })
  })

  return filtered
}

// Build a Scryfall card URL preferring the precise set+CN+lang triple.
// When set or collector_number are missing, fall back to a name search.
export function scryfallUrlFor(card: Card): string {
  const set = card.edition_code?.toLowerCase()
  const cn = card.collector_number?.trim()
  if (set && cn) {
    const lang = card.language?.toLowerCase() === 'italian' ? 'it' : 'en'
    return `https://scryfall.com/card/${encodeURIComponent(set)}/${encodeURIComponent(cn)}/${lang}`
  }
  return `https://scryfall.com/search?q=${encodeURIComponent('!"' + card.name + '"')}`
}

// Single-char rarity → tailwind-friendly color token (rarità is the only
// MTG-flavored bit on the screen, kept intentionally minimal).
export function rarityColor(rarity: string | undefined): string {
  switch ((rarity ?? '').toLowerCase()) {
    case 'm':
    case 'mythic':
      return '#f97316'
    case 'r':
    case 'rare':
      return '#eab308'
    case 'u':
    case 'uncommon':
      return '#a3a3a3'
    case 's':
    case 'special':
      return '#a855f7'
    case 'b':
    case 'bonus':
      return '#0ea5e9'
    default:
      return '#52525b'
  }
}
