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
  parsed_colors?: string[]
  parsed_color_identity?: string[]
  parsed_tags?: CardTag[]
}

export interface CardTag {
  name: string
  colorIndex?: number
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
  lastUpdated?: string
  cacheVersion?: number
}
