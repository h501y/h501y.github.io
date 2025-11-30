import { useState, useEffect, useMemo } from 'react'
import type {
  WebCollectionData,
  ColorFilters,
  ColorMode,
  RarityFilters,
  StatType,
  StatOperator,
  SortField,
  SortDirection
} from '../types'

export function useCollection() {
  const [data, setData] = useState<WebCollectionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [nameFilter, setNameFilter] = useState('')
  const [textFilter, setTextFilter] = useState('')
  const [typeLineFilter, setTypeLineFilter] = useState('')
  const [colorFilters, setColorFilters] = useState<ColorFilters>({
    W: false,
    U: false,
    B: false,
    R: false,
    G: false,
    C: false
  })
  const [colorMode, setColorMode] = useState<ColorMode>('including')
  const [colorIdentityFilters, setColorIdentityFilters] = useState<ColorFilters>({
    W: false,
    U: false,
    B: false,
    R: false,
    G: false,
    C: false
  })
  const [manaCostFilter, setManaCostFilter] = useState('')
  const [statType, setStatType] = useState<StatType>('cmc')
  const [statOperator, setStatOperator] = useState<StatOperator>('=')
  const [statValue, setStatValue] = useState('')
  const [setFilter, setSetFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [rarityFilters, setRarityFilters] = useState<RarityFilters>({
    mythic: true,
    rare: true,
    uncommon: true,
    common: true
  })

  // Sorting
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Load collection data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const response = await fetch('/collection-data.json')
        if (!response.ok) {
          throw new Error('Failed to load collection data')
        }
        const json = await response.json()
        setData(json)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    if (!data) return []

    let cards = [...data.cards]

    // Name filter
    if (nameFilter) {
      const name = nameFilter.toLowerCase()
      cards = cards.filter(c =>
        c.name.toLowerCase().includes(name) ||
        c.italian_name?.toLowerCase().includes(name)
      )
    }

    // Text filter (oracle text)
    if (textFilter) {
      const text = textFilter.toLowerCase()
      cards = cards.filter(c =>
        c.oracle_text?.toLowerCase().includes(text)
      )
    }

    // Type line filter
    if (typeLineFilter) {
      const type = typeLineFilter.toLowerCase()
      cards = cards.filter(c =>
        c.type_line?.toLowerCase().includes(type)
      )
    }

    // Color filters
    const activeColors = Object.entries(colorFilters)
      .filter(([, active]) => active)
      .map(([color]) => color)

    if (activeColors.length > 0) {
      cards = cards.filter(card => {
        const cardColors = card.colors ? JSON.parse(card.colors) : []

        if (colorMode === 'exactly') {
          return activeColors.length === cardColors.length &&
            activeColors.every(c => cardColors.includes(c))
        } else if (colorMode === 'including') {
          return activeColors.some(c => cardColors.includes(c))
        } else { // at_most
          return cardColors.every((c: string) => activeColors.includes(c))
        }
      })
    }

    // Color identity filters
    const activeIdentityColors = Object.entries(colorIdentityFilters)
      .filter(([, active]) => active)
      .map(([color]) => color)

    if (activeIdentityColors.length > 0) {
      cards = cards.filter(card => {
        const cardIdentity = card.color_identity ? JSON.parse(card.color_identity) : []
        return activeIdentityColors.some(c => cardIdentity.includes(c))
      })
    }

    // Mana cost filter
    if (manaCostFilter) {
      cards = cards.filter(c =>
        c.mana_cost?.includes(manaCostFilter)
      )
    }

    // Stat filters (CMC, Power, Toughness)
    if (statValue) {
      const value = statType === 'cmc' ? parseFloat(statValue) : statValue
      cards = cards.filter(card => {
        let cardValue: number | string | undefined

        if (statType === 'cmc') {
          cardValue = card.cmc
        } else if (statType === 'power') {
          cardValue = card.power
        } else if (statType === 'toughness') {
          cardValue = card.toughness
        }

        if (cardValue === undefined) return false

        if (statType === 'cmc') {
          const numValue = typeof cardValue === 'number' ? cardValue : parseFloat(String(cardValue))
          const targetValue = typeof value === 'number' ? value : parseFloat(String(value))

          if (statOperator === '=') return numValue === targetValue
          if (statOperator === '>') return numValue > targetValue
          if (statOperator === '<') return numValue < targetValue
          if (statOperator === '>=') return numValue >= targetValue
          if (statOperator === '<=') return numValue <= targetValue
        } else {
          if (statOperator === '=') return cardValue === value
        }

        return false
      })
    }

    // Set filter
    if (setFilter) {
      cards = cards.filter(c => c.edition_code === setFilter)
    }

    // Tag filter
    if (tagFilter) {
      cards = cards.filter(c => {
        if (!c.tags) return false
        const tags = JSON.parse(c.tags)
        return tags.some((t: { name: string }) => t.name === tagFilter)
      })
    }

    // Rarity filter
    const activeRarities = Object.entries(rarityFilters)
      .filter(([, active]) => active)
      .map(([rarity]) => rarity)

    if (activeRarities.length < 4) {
      cards = cards.filter(card => {
        const r = card.rarity.toLowerCase()
        if (r === 'm' || r === 'mythic') return activeRarities.includes('mythic')
        if (r === 'r' || r === 'rare') return activeRarities.includes('rare')
        if (r === 'u' || r === 'uncommon') return activeRarities.includes('uncommon')
        if (r === 'c' || r === 'common') return activeRarities.includes('common')
        return false
      })
    }

    // Sorting
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

      if (aVal === undefined || bVal === undefined) return 0

      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return cards
  }, [
    data,
    nameFilter,
    textFilter,
    typeLineFilter,
    colorFilters,
    colorMode,
    colorIdentityFilters,
    manaCostFilter,
    statType,
    statOperator,
    statValue,
    setFilter,
    tagFilter,
    rarityFilters,
    sortField,
    sortDirection
  ])

  const clearFilters = () => {
    setNameFilter('')
    setTextFilter('')
    setTypeLineFilter('')
    setColorFilters({ W: false, U: false, B: false, R: false, G: false, C: false })
    setColorMode('including')
    setColorIdentityFilters({ W: false, U: false, B: false, R: false, G: false, C: false })
    setManaCostFilter('')
    setStatValue('')
    setSetFilter('')
    setTagFilter('')
    setRarityFilters({ mythic: true, rare: true, uncommon: true, common: true })
  }

  return {
    // Data
    data,
    isLoading,
    error,
    cards: filteredCards,

    // Filters
    nameFilter,
    setNameFilter,
    textFilter,
    setTextFilter,
    typeLineFilter,
    setTypeLineFilter,
    colorFilters,
    setColorFilters,
    colorMode,
    setColorMode,
    colorIdentityFilters,
    setColorIdentityFilters,
    manaCostFilter,
    setManaCostFilter,
    statType,
    setStatType,
    statOperator,
    setStatOperator,
    statValue,
    setStatValue,
    setFilter,
    setSetFilter,
    tagFilter,
    setTagFilter,
    rarityFilters,
    setRarityFilters,
    clearFilters,

    // Sorting
    sortField,
    setSortField,
    sortDirection,
    setSortDirection
  }
}
