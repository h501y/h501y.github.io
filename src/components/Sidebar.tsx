import type { ColorFilters, ColorMode, RarityFilters, StatType, StatOperator, CollectionStats, CardSet } from '../types'
import { Accordion } from './Accordion'
import { NameTextFilter } from './filters/NameTextFilter'
import { ColorFilter } from './filters/ColorFilter'
import { TypeFilter } from './filters/TypeFilter'
import { RaritySetFilter } from './filters/RaritySetFilter'
import { StatsFilter } from './filters/StatsFilter'

interface SidebarProps {
  isOpen: boolean
  stats: CollectionStats
  filteredCount: number
  rarityStats: Record<string, number>

  // Filters
  nameFilter: string
  textFilter: string
  typeLineFilter: string
  colorFilters: ColorFilters
  colorMode: ColorMode
  colorIdentityFilters: ColorFilters
  manaCostFilter: string
  statType: StatType
  statOperator: StatOperator
  statValue: string
  setFilter: string
  tagFilter: string
  rarityFilters: RarityFilters
  allSets: CardSet[]
  allTags: string[]

  // Filter handlers
  onNameFilterChange: (value: string) => void
  onTextFilterChange: (value: string) => void
  onTypeLineFilterChange: (value: string) => void
  onColorFiltersChange: (filters: ColorFilters) => void
  onColorModeChange: (mode: ColorMode) => void
  onColorIdentityFiltersChange: (filters: ColorFilters) => void
  onManaCostFilterChange: (value: string) => void
  onStatTypeChange: (type: StatType) => void
  onStatOperatorChange: (operator: StatOperator) => void
  onStatValueChange: (value: string) => void
  onSetFilterChange: (value: string) => void
  onTagFilterChange: (value: string) => void
  onRarityFiltersChange: (filters: RarityFilters) => void
  onClearFilters: () => void
  onClose: () => void

  exportedAt?: string
  version?: string
}

export function Sidebar(props: SidebarProps) {
  const activeColorFilters = Object.values(props.colorFilters).filter(Boolean).length
  const activeColorIdentityFilters = Object.values(props.colorIdentityFilters).filter(Boolean).length
  const activeRarityFilters = Object.values(props.rarityFilters).filter(Boolean).length

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-0
        w-80 sm:w-96 glass transform transition-transform duration-300
        ${props.isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col overflow-hidden h-full
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold gradient-text">
            Magic Collection
          </h1>
          <button
            onClick={props.onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="text-xs space-y-1" style={{ color: 'var(--color-gray-400)' }}>
          <div className="flex justify-between">
            <span>Totale:</span>
            <span className="font-semibold" style={{ color: 'var(--color-gray-100)' }}>
              {props.stats.total_cards}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Uniche:</span>
            <span className="font-semibold" style={{ color: 'var(--color-gray-100)' }}>
              {props.stats.unique_cards}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Filtrate:</span>
            <span className="font-semibold" style={{ color: 'var(--color-accent-500)' }}>
              {props.filteredCount}
            </span>
          </div>
        </div>

        <button onClick={props.onClearFilters} className="btn-glass w-full text-xs py-2 mt-3">
          Cancella Filtri
        </button>
      </div>

      {/* Filters - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Accordion title="Nome & Testo" defaultOpen={!!(props.nameFilter || props.textFilter)}>
          <NameTextFilter
            nameFilter={props.nameFilter}
            textFilter={props.textFilter}
            onNameFilterChange={props.onNameFilterChange}
            onTextFilterChange={props.onTextFilterChange}
          />
        </Accordion>

        <Accordion title="Colori" defaultOpen={activeColorFilters > 0 || activeColorIdentityFilters > 0} badge={(activeColorFilters + activeColorIdentityFilters) > 0 ? (activeColorFilters + activeColorIdentityFilters) : undefined}>
          <ColorFilter
            colorFilters={props.colorFilters}
            colorMode={props.colorMode}
            colorIdentityFilters={props.colorIdentityFilters}
            onColorFiltersChange={props.onColorFiltersChange}
            onColorModeChange={props.onColorModeChange}
            onColorIdentityFiltersChange={props.onColorIdentityFiltersChange}
          />
        </Accordion>

        <Accordion title="Tipo" defaultOpen={!!props.typeLineFilter}>
          <TypeFilter
            typeLineFilter={props.typeLineFilter}
            onTypeLineFilterChange={props.onTypeLineFilterChange}
          />
        </Accordion>

        <Accordion title="Rarità & Espansione" defaultOpen={activeRarityFilters < 4 || !!props.setFilter || !!props.tagFilter}>
          <RaritySetFilter
            rarityFilters={props.rarityFilters}
            setFilter={props.setFilter}
            tagFilter={props.tagFilter}
            allSets={props.allSets}
            allTags={props.allTags}
            rarityStats={props.rarityStats}
            onRarityFiltersChange={props.onRarityFiltersChange}
            onSetFilterChange={props.onSetFilterChange}
            onTagFilterChange={props.onTagFilterChange}
          />
        </Accordion>

        <Accordion title="Mana & Statistiche" defaultOpen={!!(props.manaCostFilter || props.statValue)}>
          <StatsFilter
            manaCostFilter={props.manaCostFilter}
            statType={props.statType}
            statOperator={props.statOperator}
            statValue={props.statValue}
            onManaCostFilterChange={props.onManaCostFilterChange}
            onStatTypeChange={props.onStatTypeChange}
            onStatOperatorChange={props.onStatOperatorChange}
            onStatValueChange={props.onStatValueChange}
          />
        </Accordion>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-center" style={{ color: 'var(--color-gray-500)' }}>
          v{props.version || '1.0.0'}
          {props.exportedAt && (
            <>
              <br />
              Aggiornato: {new Date(props.exportedAt).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
