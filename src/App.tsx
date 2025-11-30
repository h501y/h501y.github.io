import { useState } from 'react'
import { useCollection } from './hooks/useCollection'
import { Sidebar } from './components/Sidebar'
import { CardGrid } from './components/CardGrid'

export default function App() {
  const collection = useCollection()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
          <CardGrid
            cards={collection.cards}
          />
        </div>
      </main>
    </div>
  )
}
