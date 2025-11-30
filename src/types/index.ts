export interface Card {
  id?: number
  name: string
  edition: string
  edition_code?: string
  language: string
  card_type?: string
  rarity: string
  quantity: number
  scryfall_id?: string
  tags?: string
  italian_name?: string
  image_uris?: string
  mana_cost?: string
  cmc?: number
  type_line?: string
  oracle_text?: string
  colors?: string
  color_identity?: string
  power?: string
  toughness?: string
  prices?: string
  edhrec_rank?: number
  collector_number?: string
  finishes?: string
  frame_effects?: string
  promo?: boolean
  promo_types?: string
}

export interface CardSet {
  set_code: string
  set_name: string
  released_at?: string
}

export interface CollectionStats {
  total_cards: number
  unique_cards: number
  by_rarity: Array<{ rarity: string; count: number }>
}

export interface WebCollectionData {
  version: string
  exported_at: string
  stats: CollectionStats
  cards: Card[]
  sets: CardSet[]
  tags: string[]
}

export type SortField = 'name' | 'type_line' | 'edition' | 'rarity' | 'cmc' | 'quantity'
export type SortDirection = 'asc' | 'desc'

export interface ColorFilters {
  W: boolean
  U: boolean
  B: boolean
  R: boolean
  G: boolean
  C: boolean
}

export type ColorMode = 'exactly' | 'including' | 'at_most'
export type StatType = 'cmc' | 'power' | 'toughness'
export type StatOperator = '=' | '>' | '<' | '>=' | '<='

export interface RarityFilters {
  mythic: boolean
  rare: boolean
  uncommon: boolean
  common: boolean
}
