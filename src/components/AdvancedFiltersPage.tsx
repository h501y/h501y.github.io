import type { CollectionStats, ColorFilters, ColorMode, RarityFilters, StatOperator, StatType } from '../types'
import { NameTextFilter } from './filters/NameTextFilter'
import { TypeFilter } from './filters/TypeFilter'
import { ColorFilter } from './filters/ColorFilter'
import { RaritySetFilter } from './filters/RaritySetFilter'
import { StatsFilter } from './filters/StatsFilter'
import { lightHaptic, mediumHaptic } from '../utils/haptics'

interface AdvancedFiltersPageProps {
  stats: CollectionStats
  filteredCount: number
  activeFilterCount: number

  nameFilter: string
  textFilter: string
  typeLineFilter: string
  colorFilters: ColorFilters
  colorMode: ColorMode
  colorIdentityFilters: ColorFilters
  manaCostFilter: string
  manaCostExact: boolean
  statType: StatType
  statOperator: StatOperator
  statValue: string
  tagFilter: string
  rarityFilters: RarityFilters
  allTags: string[]

  onNameFilterChange: (value: string) => void
  onTextFilterChange: (value: string) => void
  onTypeLineFilterChange: (value: string) => void
  onColorFiltersChange: (filters: ColorFilters) => void
  onColorModeChange: (mode: ColorMode) => void
  onColorIdentityFiltersChange: (filters: ColorFilters) => void
  onManaCostFilterChange: (value: string) => void
  onManaCostExactChange: (value: boolean) => void
  onStatTypeChange: (type: StatType) => void
  onStatOperatorChange: (operator: StatOperator) => void
  onStatValueChange: (value: string) => void
  onTagFilterChange: (value: string) => void
  onRarityFiltersChange: (filters: RarityFilters) => void
  onClearFilters: () => void
  onApply: () => void
}

export function AdvancedFiltersPage(props: AdvancedFiltersPageProps) {
  return (
    <div className="relative min-h-full">
      <div
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* ── Stat strip ── */}
        <div className="stat-strip py-3 px-1 mb-1">
          <div className="stat-strip-item">
            <span className="stat-strip-value">{props.stats.total_cards.toLocaleString('it-IT')}</span>
            <span className="stat-strip-label">Totale</span>
          </div>
          <div className="stat-strip-item">
            <span className="stat-strip-value">{props.stats.unique_cards.toLocaleString('it-IT')}</span>
            <span className="stat-strip-label">Uniche</span>
          </div>
          <div className="stat-strip-item">
            <span className="stat-strip-value accent">{props.filteredCount.toLocaleString('it-IT')}</span>
            <span className="stat-strip-label">Visibili</span>
          </div>
          <div className="stat-strip-item">
            <span className="stat-strip-value">{props.activeFilterCount}</span>
            <span className="stat-strip-label">Filtri</span>
          </div>
          <div className="flex items-center pl-3">
            <button
              onClick={() => { lightHaptic(); props.onClearFilters() }}
              className="text-xs px-2.5 py-1 rounded-lg transition-colors hover:bg-white/10 press-feedback"
              style={{ border: '1px solid var(--overlay-white-20)', color: 'var(--color-accent-400)' }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* ── Nome e Testo ── */}
        <div className="filter-section">
          <div className="filter-section-header">
            <svg className="filter-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="filter-section-label">Nome e Testo</span>
          </div>
          <NameTextFilter
            nameFilter={props.nameFilter}
            textFilter={props.textFilter}
            onNameFilterChange={props.onNameFilterChange}
            onTextFilterChange={props.onTextFilterChange}
            textHelperText="Cerca nelle regole della carta. Le parole possono essere in qualsiasi ordine."
          />
        </div>

        {/* ── Colori ── */}
        <div className="filter-section">
          <div className="filter-section-header">
            <svg className="filter-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span className="filter-section-label">Colori</span>
          </div>
          <ColorFilter
            colorFilters={props.colorFilters}
            colorMode={props.colorMode}
            colorIdentityFilters={props.colorIdentityFilters}
            onColorFiltersChange={props.onColorFiltersChange}
            onColorModeChange={props.onColorModeChange}
            onColorIdentityFiltersChange={props.onColorIdentityFiltersChange}
          />
        </div>

        {/* ── Tipo ── */}
        <div className="filter-section">
          <div className="filter-section-header">
            <svg className="filter-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="filter-section-label">Tipo</span>
          </div>
          <TypeFilter
            typeLineFilter={props.typeLineFilter}
            onTypeLineFilterChange={props.onTypeLineFilterChange}
          />
        </div>

        {/* ── Rarità e Set ── */}
        <div className="filter-section">
          <div className="filter-section-header">
            <svg className="filter-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="filter-section-label">Rarità e Tag</span>
          </div>
          <RaritySetFilter
            rarityFilters={props.rarityFilters}
            tagFilter={props.tagFilter}
            allTags={props.allTags}
            onRarityFiltersChange={props.onRarityFiltersChange}
            onTagFilterChange={props.onTagFilterChange}
          />
        </div>

        {/* ── Mana e Statistiche ── */}
        <div className="filter-section">
          <div className="filter-section-header">
            <svg className="filter-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="filter-section-label">Mana e Statistiche</span>
          </div>
          <StatsFilter
            manaCostFilter={props.manaCostFilter}
            manaCostExact={props.manaCostExact}
            statType={props.statType}
            statOperator={props.statOperator}
            statValue={props.statValue}
            onManaCostFilterChange={props.onManaCostFilterChange}
            onManaCostExactChange={props.onManaCostExactChange}
            onStatTypeChange={props.onStatTypeChange}
            onStatOperatorChange={props.onStatOperatorChange}
            onStatValueChange={props.onStatValueChange}
          />
        </div>
      </div>

      {/* ── CTA fixed bottom ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 p-3 flex gap-2"
        style={{
          background: 'var(--surface-footer)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--surface-highlight)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <button
          onClick={() => {
            mediumHaptic()
            props.onApply()
          }}
          className="flex-1 py-3 min-h-[48px] rounded-xl text-sm font-semibold transition-colors touch-target press-feedback"
          style={{
            background: 'rgba(var(--color-primary-rgb), 0.3)',
            border: '1px solid var(--color-primary-500)',
            color: 'var(--color-primary-200)',
          }}
        >
          Vedi Risultati ({props.filteredCount})
        </button>
      </div>
    </div>
  )
}
