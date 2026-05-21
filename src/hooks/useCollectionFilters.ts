import { useEffect, useMemo, useState } from 'react'
import type {
  CollectionFilterValues,
  ColorFilters,
  ColorMode,
  RarityFilters,
  SortDirection,
  SortField,
  StatOperator,
  StatType
} from '../types'

const FILTERS_STORAGE_KEY = 'mtgCollection.filters.v1'

export const DEFAULT_COLOR_FILTERS: ColorFilters = {
  W: false,
  U: false,
  B: false,
  R: false,
  G: false,
  C: false
}

export const DEFAULT_RARITY_FILTERS: RarityFilters = {
  mythic: true,
  rare: true,
  uncommon: true,
  common: true
}

const COLOR_MODES: ColorMode[] = ['exactly', 'including', 'at_most']
const STAT_TYPES: StatType[] = ['cmc', 'power', 'toughness']
const STAT_OPERATORS: StatOperator[] = ['=', '>', '<', '>=', '<=']
const SORT_FIELDS: SortField[] = ['name', 'type_line', 'edition', 'rarity', 'cmc', 'quantity']
const SORT_DIRECTIONS: SortDirection[] = ['asc', 'desc']

function getStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage
    return typeof storage === 'undefined' ? null : storage
  } catch {
    return null
  }
}

function createDefaultFilters(): CollectionFilterValues {
  return {
    nameFilter: '',
    textFilter: '',
    typeLineFilter: '',
    colorFilters: { ...DEFAULT_COLOR_FILTERS },
    colorMode: 'including',
    colorIdentityFilters: { ...DEFAULT_COLOR_FILTERS },
    manaCostFilter: '',
    manaCostExact: false,
    statType: 'cmc',
    statOperator: '=',
    statValue: '',
    setFilter: '',
    tagFilter: '',
    rarityFilters: { ...DEFAULT_RARITY_FILTERS },
    sortField: 'name',
    sortDirection: 'asc'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function parseEnum<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback
}

function parseColorFilters(value: unknown, fallback: ColorFilters): ColorFilters {
  if (!isRecord(value)) {
    return { ...fallback }
  }

  return {
    W: value.W === true,
    U: value.U === true,
    B: value.B === true,
    R: value.R === true,
    G: value.G === true,
    C: value.C === true
  }
}

function parseRarityFilters(value: unknown, fallback: RarityFilters): RarityFilters {
  if (!isRecord(value)) {
    return { ...fallback }
  }

  return {
    mythic: value.mythic !== false,
    rare: value.rare !== false,
    uncommon: value.uncommon !== false,
    common: value.common !== false
  }
}

function parsePersistedFilters(raw: string | null): CollectionFilterValues | null {
  if (!raw) {
    return null
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isRecord(parsed)) {
    return null
  }

  return {
    nameFilter: parseString(parsed.nameFilter),
    textFilter: parseString(parsed.textFilter),
    typeLineFilter: parseString(parsed.typeLineFilter),
    colorFilters: parseColorFilters(parsed.colorFilters, DEFAULT_COLOR_FILTERS),
    colorMode: parseEnum(parsed.colorMode, COLOR_MODES, 'including'),
    colorIdentityFilters: parseColorFilters(parsed.colorIdentityFilters, DEFAULT_COLOR_FILTERS),
    manaCostFilter: parseString(parsed.manaCostFilter),
    manaCostExact: parsed.manaCostExact !== false,
    statType: parseEnum(parsed.statType, STAT_TYPES, 'cmc'),
    statOperator: parseEnum(parsed.statOperator, STAT_OPERATORS, '='),
    statValue: parseString(parsed.statValue),
    setFilter: parseString(parsed.setFilter),
    tagFilter: parseString(parsed.tagFilter),
    rarityFilters: parseRarityFilters(parsed.rarityFilters, DEFAULT_RARITY_FILTERS),
    sortField: parseEnum(parsed.sortField, SORT_FIELDS, 'name'),
    sortDirection: parseEnum(parsed.sortDirection, SORT_DIRECTIONS, 'asc')
  }
}

function getInitialFilters(): CollectionFilterValues {
  const storage = getStorage()
  if (!storage) {
    return createDefaultFilters()
  }

  try {
    const persisted = parsePersistedFilters(storage.getItem(FILTERS_STORAGE_KEY))
    return persisted ?? createDefaultFilters()
  } catch (error) {
    console.warn('Failed to read filters from localStorage.', error)
    return createDefaultFilters()
  }
}

export interface UseCollectionFiltersResult extends CollectionFilterValues {
  debouncedNameFilter: string
  debouncedTextFilter: string
  setNameFilter: (value: string) => void
  setTextFilter: (value: string) => void
  setTypeLineFilter: (value: string) => void
  setColorFilters: (filters: ColorFilters) => void
  setColorMode: (mode: ColorMode) => void
  setColorIdentityFilters: (filters: ColorFilters) => void
  setManaCostFilter: (value: string) => void
  setManaCostExact: (value: boolean) => void
  setStatType: (type: StatType) => void
  setStatOperator: (operator: StatOperator) => void
  setStatValue: (value: string) => void
  setSetFilter: (value: string) => void
  setTagFilter: (value: string) => void
  setRarityFilters: (filters: RarityFilters) => void
  setSortField: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  clearFilters: () => void
}

export function useCollectionFilters(): UseCollectionFiltersResult {
  const initialFilters = useMemo(getInitialFilters, [])

  const [nameFilter, setNameFilter] = useState(initialFilters.nameFilter)
  const [textFilter, setTextFilter] = useState(initialFilters.textFilter)
  const [debouncedNameFilter, setDebouncedNameFilter] = useState(initialFilters.nameFilter)
  const [debouncedTextFilter, setDebouncedTextFilter] = useState(initialFilters.textFilter)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedNameFilter(nameFilter), 250)
    return () => clearTimeout(id)
  }, [nameFilter])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedTextFilter(textFilter), 250)
    return () => clearTimeout(id)
  }, [textFilter])
  const [typeLineFilter, setTypeLineFilter] = useState(initialFilters.typeLineFilter)
  const [colorFilters, setColorFilters] = useState<ColorFilters>(initialFilters.colorFilters)
  const [colorMode, setColorMode] = useState<ColorMode>(initialFilters.colorMode)
  const [colorIdentityFilters, setColorIdentityFilters] = useState<ColorFilters>(initialFilters.colorIdentityFilters)
  const [manaCostFilter, setManaCostFilter] = useState(initialFilters.manaCostFilter)
  const [manaCostExact, setManaCostExact] = useState(initialFilters.manaCostExact)
  const [statType, setStatType] = useState<StatType>(initialFilters.statType)
  const [statOperator, setStatOperator] = useState<StatOperator>(initialFilters.statOperator)
  const [statValue, setStatValue] = useState(initialFilters.statValue)
  const [setFilter, setSetFilter] = useState(initialFilters.setFilter)
  const [tagFilter, setTagFilter] = useState(initialFilters.tagFilter)
  const [rarityFilters, setRarityFilters] = useState<RarityFilters>(initialFilters.rarityFilters)
  const [sortField, setSortField] = useState<SortField>(initialFilters.sortField)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialFilters.sortDirection)

  useEffect(() => {
    const payload: CollectionFilterValues = {
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
    }

    const timerId = setTimeout(() => {
      const storage = getStorage()
      if (!storage) return

      try {
        storage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(payload))
      } catch (error) {
        console.warn('Failed to save filters to localStorage.', error)
      }
    }, 400)

    return () => clearTimeout(timerId)
  }, [
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
  ])

  const clearFilters = () => {
    setNameFilter('')
    setTextFilter('')
    setTypeLineFilter('')
    setColorFilters({ ...DEFAULT_COLOR_FILTERS })
    setColorMode('including')
    setColorIdentityFilters({ ...DEFAULT_COLOR_FILTERS })
    setManaCostFilter('')
    setManaCostExact(false)
    setStatType('cmc')
    setStatOperator('=')
    setStatValue('')
    setSetFilter('')
    setTagFilter('')
    setRarityFilters({ ...DEFAULT_RARITY_FILTERS })
    setSortField('name')
    setSortDirection('asc')
  }

  return {
    nameFilter,
    setNameFilter,
    debouncedNameFilter,
    textFilter,
    setTextFilter,
    debouncedTextFilter,
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
    manaCostExact,
    setManaCostExact,
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
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    clearFilters
  }
}
