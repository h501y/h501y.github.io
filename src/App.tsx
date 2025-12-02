import { useState, useMemo } from 'react'
import { useCollection } from './hooks/useCollection'
import { Sidebar } from './components/Sidebar'
import { CardGrid } from './components/CardGrid'
import { SearchBar } from './components/SearchBar'
import { parseQuery } from './utils/queryParser'

export default function App() {
  const collection = useCollection()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    if (!collection.data) return false

    // Check text filters
    if (collection.nameFilter.trim()) return true
    if (collection.textFilter.trim()) return true
    if (collection.typeLineFilter.trim()) return true
    if (collection.manaCostFilter.trim()) return true
    if (collection.statValue.trim()) return true

    // Check dropdown filters
    if (collection.setFilter) return true
    if (collection.tagFilter) return true

    // Check color filters
    if (Object.values(collection.colorFilters).some(v => v)) return true

    // Check color identity filters
    if (Object.values(collection.colorIdentityFilters).some(v => v)) return true

    // Check rarity filters (if any are disabled, it means filtering is active)
    if (!collection.rarityFilters.mythic || !collection.rarityFilters.rare ||
        !collection.rarityFilters.uncommon || !collection.rarityFilters.common) return true

    return false
  }, [
    collection.data,
    collection.nameFilter,
    collection.textFilter,
    collection.typeLineFilter,
    collection.manaCostFilter,
    collection.statValue,
    collection.setFilter,
    collection.tagFilter,
    collection.colorFilters,
    collection.colorIdentityFilters,
    collection.rarityFilters
  ])

  // Handle query search
  const handleQuerySearch = (query: string) => {
    const parsed = parseQuery(query)

    // Apply filters based on parsed query
    if (parsed.name) {
      collection.setNameFilter(parsed.name)
    }

    if (parsed.type) {
      collection.setTypeLineFilter(parsed.type)
    }

    if (parsed.text) {
      collection.setTextFilter(parsed.text)
    }

    if (parsed.colors && parsed.colors.length > 0) {
      const newFilters = { W: false, U: false, B: false, R: false, G: false, C: false }
      parsed.colors.forEach(c => {
        if (c in newFilters) {
          newFilters[c as keyof typeof newFilters] = true
        }
      })
      collection.setColorFilters(newFilters)
    }

    if (parsed.identity && parsed.identity.length > 0) {
      const newFilters = { W: false, U: false, B: false, R: false, G: false, C: false }
      parsed.identity.forEach(c => {
        if (c in newFilters) {
          newFilters[c as keyof typeof newFilters] = true
        }
      })
      collection.setColorIdentityFilters(newFilters)
    }

    if (parsed.rarity && parsed.rarity.length > 0) {
      const newFilters = { mythic: false, rare: false, uncommon: false, common: false }
      parsed.rarity.forEach(r => {
        if (r in newFilters) {
          newFilters[r as keyof typeof newFilters] = true
        }
      })
      collection.setRarityFilters(newFilters)
    }

    if (parsed.set) {
      collection.setSetFilter(parsed.set)
    }

    if (parsed.tag) {
      collection.setTagFilter(parsed.tag)
    }

    if (parsed.cmc) {
      // For CMC, convert to the format used by manaCostFilter
      const { operator, value } = parsed.cmc
      collection.setManaCostFilter(`${operator}${value}`)
    }

    if (parsed.power || parsed.toughness) {
      // For power/toughness, use the stat filters
      if (parsed.power) {
        collection.setStatType('power')
        collection.setStatOperator(parsed.power.operator as '=' | '>' | '<' | '>=' | '<=')
        collection.setStatValue(String(parsed.power.value))
      } else if (parsed.toughness) {
        collection.setStatType('toughness')
        collection.setStatOperator(parsed.toughness.operator as '=' | '>' | '<' | '>=' | '<=')
        collection.setStatValue(String(parsed.toughness.value))
      }
    }
  }

  if (collection.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }}
          />
          <p className="text-lg" style={{ color: 'var(--color-gray-300)' }}>
            Caricamento collezione...
          </p>
        </div>
      </div>
    )
  }

  if (collection.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass p-8 rounded-xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-error-500)' }}>
            Errore di caricamento
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
            {collection.error}
          </p>
          <p className="text-xs mt-4" style={{ color: 'var(--color-gray-500)' }}>
            Assicurati che il file collection-data.json sia presente nella directory public.
          </p>
        </div>
      </div>
    )
  }

  const stats = collection.data!.stats
  const rarityStats = stats.by_rarity.reduce((acc, { rarity, count }) => {
    const r = rarity.toLowerCase()
    if (r === 'm' || r === 'mythic') acc.mythic = count
    else if (r === 'r' || r === 'rare') acc.rare = count
    else if (r === 'u' || r === 'uncommon') acc.uncommon = count
    else if (r === 'c' || r === 'common') acc.common = count
    return acc
  }, { mythic: 0, rare: 0, uncommon: 0, common: 0 })

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        stats={stats}
        filteredCount={collection.cards.length}
        rarityStats={rarityStats}
        nameFilter={collection.nameFilter}
        textFilter={collection.textFilter}
        typeLineFilter={collection.typeLineFilter}
        colorFilters={collection.colorFilters}
        colorMode={collection.colorMode}
        colorIdentityFilters={collection.colorIdentityFilters}
        manaCostFilter={collection.manaCostFilter}
        statType={collection.statType}
        statOperator={collection.statOperator}
        statValue={collection.statValue}
        setFilter={collection.setFilter}
        tagFilter={collection.tagFilter}
        rarityFilters={collection.rarityFilters}
        allSets={collection.data!.sets}
        allTags={collection.data!.tags}
        onNameFilterChange={collection.setNameFilter}
        onTextFilterChange={collection.setTextFilter}
        onTypeLineFilterChange={collection.setTypeLineFilter}
        onColorFiltersChange={collection.setColorFilters}
        onColorModeChange={collection.setColorMode}
        onColorIdentityFiltersChange={collection.setColorIdentityFilters}
        onManaCostFilterChange={collection.setManaCostFilter}
        onStatTypeChange={collection.setStatType}
        onStatOperatorChange={collection.setStatOperator}
        onStatValueChange={collection.setStatValue}
        onSetFilterChange={collection.setSetFilter}
        onTagFilterChange={collection.setTagFilter}
        onRarityFiltersChange={collection.setRarityFilters}
        onClearFilters={collection.clearFilters}
        onClose={() => setIsSidebarOpen(false)}
        exportedAt={collection.data!.exported_at}
        version={collection.data!.version}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Header */}
        <header className="glass p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h2 className="text-lg font-semibold">
            Collezione ({collection.cards.length} carte)
          </h2>

          <div className="w-10" />
        </header>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {!hasActiveFilters ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              {/* Search Bar */}
              <div className="w-full max-w-2xl">
                <SearchBar
                  onSearch={handleQuerySearch}
                  placeholder="Cerca per nome (Lightning Bolt) o usa sintassi avanzata (c:r t:creature)..."
                />
              </div>

              {/* Placeholder Message */}
              <div className="text-center glass p-8 rounded-xl max-w-md">
                <svg className="w-12 h-12 mx-auto mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-lg font-semibold mb-2">Cerca le tue carte</h2>
                <p className="text-sm text-muted-foreground">
                  Totale: <span className="font-semibold" style={{ color: 'var(--color-accent-500)' }}>{stats.total_cards}</span> carte
                </p>
              </div>
            </div>
          ) : (
            <CardGrid cards={collection.cards} />
          )}
        </div>
      </main>
    </div>
  )
}
