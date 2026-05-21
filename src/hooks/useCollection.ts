import { useMemo } from 'react'
import { useCollectionData } from './useCollectionData'
import { useCollectionFilters } from './useCollectionFilters'
import { filterCards } from '../utils/filterCards'

export function useCollection() {
  const { data, isLoading, error, dataSource, isDataStale, reloadData } = useCollectionData()
  const filters = useCollectionFilters()

  const cards = useMemo(() => {
    return filterCards(data, {
      nameFilter: filters.debouncedNameFilter,
      textFilter: filters.debouncedTextFilter,
      typeLineFilter: filters.typeLineFilter,
      colorFilters: filters.colorFilters,
      colorMode: filters.colorMode,
      colorIdentityFilters: filters.colorIdentityFilters,
      manaCostFilter: filters.manaCostFilter,
      manaCostExact: filters.manaCostExact,
      statType: filters.statType,
      statOperator: filters.statOperator,
      statValue: filters.statValue,
      setFilter: filters.setFilter,
      tagFilter: filters.tagFilter,
      rarityFilters: filters.rarityFilters,
      sortField: filters.sortField,
      sortDirection: filters.sortDirection
    })
  }, [
    data,
    filters.debouncedNameFilter,
    filters.debouncedTextFilter,
    filters.typeLineFilter,
    filters.colorFilters,
    filters.colorMode,
    filters.colorIdentityFilters,
    filters.manaCostFilter,
    filters.manaCostExact,
    filters.statType,
    filters.statOperator,
    filters.statValue,
    filters.setFilter,
    filters.tagFilter,
    filters.rarityFilters,
    filters.sortField,
    filters.sortDirection
  ])

  return {
    data,
    isLoading,
    error,
    dataSource,
    isDataStale,
    reloadData,
    cards,
    ...filters
  }
}
