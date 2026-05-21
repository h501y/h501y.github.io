import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCollection } from './hooks/useCollection'
import { NavDropdown } from './components/NavDropdown'
import { AdvancedFiltersPage } from './components/AdvancedFiltersPage'
import { CardGrid } from './components/CardGrid'
import { SearchBar } from './components/SearchBar'
import { AppLogo } from './components/AppLogo'
import { parseQuery } from './utils/queryParser'
import { applyScryfallInlineFilters } from './utils/scryfallInlineFilter'
import { lightHaptic, mediumHaptic } from './utils/haptics'
import type { SortField, StatOperator, StatType } from './types'

type ViewMode = 'home' | 'results' | 'advanced'
const HISTORY_VIEW_MODE_KEY = '__mc_view_mode'

function isViewMode(value: unknown): value is ViewMode {
  return value === 'home' || value === 'results' || value === 'advanced'
}

const DATA_SOURCE_META = {
  gist: {
    label: 'Gist live',
    description: 'Dati aggiornati dal Gist.'
  },
  fallback: {
    label: 'Fallback locale',
    description: 'Gist non disponibile. In uso il dataset locale incluso nell app.'
  },
  cache: {
    label: 'Cache offline',
    description: 'Offline: in uso l ultima cache salvata sul dispositivo.'
  }
} as const

const PULL_THRESHOLD = 70

export default function App() {
  const collection = useCollection()

  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false)
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('mc-theme') as 'dark' | 'light') ?? 'dark'
    } catch {
      return 'dark'
    }
  })
  const mainRef = useRef<HTMLDivElement>(null)
  const homeRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const viewModeRef = useRef(viewMode)
  viewModeRef.current = viewMode
  const pullStartY = useRef(0)
  const isPulling = useRef(false)
  const [pullDistance, setPullDistance] = useState(0)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('mc-theme', theme)
    } catch {
      // Storage non disponibile (es. Safari private mode) - tema comunque applicato al DOM
    }
  }, [theme])

  const setViewModeWithHistory = useCallback((nextView: ViewMode, strategy: 'push' | 'replace' = 'push') => {
    setViewMode(nextView)
    if (typeof window === 'undefined') return

    const baseState = window.history.state && typeof window.history.state === 'object'
      ? (window.history.state as Record<string, unknown>)
      : {}
    const currentHistoryView = isViewMode(baseState[HISTORY_VIEW_MODE_KEY])
      ? baseState[HISTORY_VIEW_MODE_KEY]
      : null

    if (currentHistoryView === nextView && strategy === 'push') return

    const nextHistoryState = { ...baseState, [HISTORY_VIEW_MODE_KEY]: nextView }
    if (strategy === 'replace') {
      window.history.replaceState(nextHistoryState, document.title)
    } else {
      window.history.pushState(nextHistoryState, document.title)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const baseState = window.history.state && typeof window.history.state === 'object'
      ? (window.history.state as Record<string, unknown>)
      : {}
    const historyView = isViewMode(baseState[HISTORY_VIEW_MODE_KEY])
      ? baseState[HISTORY_VIEW_MODE_KEY]
      : null

    if (historyView) {
      setViewMode(historyView)
    } else {
      window.history.replaceState(
        { ...baseState, [HISTORY_VIEW_MODE_KEY]: viewModeRef.current },
        document.title
      )
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state && typeof event.state === 'object'
        ? (event.state as Record<string, unknown>)
        : {}
      const poppedView = isViewMode(state[HISTORY_VIEW_MODE_KEY]) ? state[HISTORY_VIEW_MODE_KEY] : 'home'
      setViewMode(poppedView)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const goHome = () => {
    lightHaptic()
    collection.clearFilters()
    setViewModeWithHistory('home')
  }

  const goResults = () => {
    lightHaptic()
    setViewModeWithHistory('results')
  }

  const goAdvanced = () => {
    lightHaptic()
    setViewModeWithHistory('advanced')
  }

  const dataSourceMeta = collection.dataSource ? DATA_SOURCE_META[collection.dataSource] : null
  const isNonLiveSource = collection.dataSource === 'fallback' || collection.dataSource === 'cache'
  const navControlColor = theme === 'light' ? '#2F2760' : 'var(--color-gray-200)'
  const showStaleWarning = collection.isDataStale
  const staleWarningMessage = showStaleWarning
    ? collection.dataSource === 'cache'
      ? 'Cache locale.'
      : '> 7 giorni.'
    : null
  const staleWarningSeparator = collection.dataSource === 'fallback' ? ' ' : ' · '

  const inlineScryfall = useMemo(() => {
    return applyScryfallInlineFilters(collection.cards, submittedQuery)
  }, [collection.cards, submittedQuery])

  const activeFilterCount = useMemo(() => {
    let count = 0

    if (collection.nameFilter.trim()) count++
    if (collection.textFilter.trim()) count++
    if (collection.typeLineFilter.trim()) count++

    count += Object.values(collection.colorFilters).filter(Boolean).length
    count += Object.values(collection.colorIdentityFilters).filter(Boolean).length

    if (collection.manaCostFilter.trim()) count++
    if (collection.statValue.trim()) count++
    if (collection.setFilter) count++
    if (collection.tagFilter) count++

    count += Object.values(collection.rarityFilters).filter((enabled) => !enabled).length

    return count
  }, [
    collection.nameFilter,
    collection.textFilter,
    collection.typeLineFilter,
    collection.colorFilters,
    collection.colorIdentityFilters,
    collection.manaCostFilter,
    collection.statValue,
    collection.setFilter,
    collection.tagFilter,
    collection.rarityFilters
  ])

  const totalActiveFilters = activeFilterCount + inlineScryfall.appliedLocalTokenCount

  const unsupportedOnlyQuery = submittedQuery.trim().length > 0 &&
    activeFilterCount === 0 &&
    inlineScryfall.appliedLocalTokenCount === 0 &&
    inlineScryfall.unsupportedFields.length > 0

  const hasUnsupportedFields = inlineScryfall.unsupportedFields.length > 0
  const displayedCards = unsupportedOnlyQuery ? [] : inlineScryfall.cards

  useEffect(() => {
    if (viewMode !== 'results') return
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [displayedCards, viewMode])

  useEffect(() => {
    if (viewMode !== 'home') {
      isPulling.current = false
      setPullDistance(0)
    }
  }, [viewMode])



  const handleResetAll = () => {
    lightHaptic()
    collection.clearFilters()
    setSearchQuery('')
    setSubmittedQuery('')
    setViewModeWithHistory('home')
    setIsNavDropdownOpen(false)
  }

  const handleClearFilters = () => {
    lightHaptic()
    collection.clearFilters()
    setSearchQuery('')
    setSubmittedQuery('')
    setViewModeWithHistory('advanced')
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewModeRef.current !== 'home') return
    if (homeRef.current && homeRef.current.scrollTop > 0) return
    pullStartY.current = e.touches[0].clientY
    isPulling.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current) return
    if (viewModeRef.current !== 'home') {
      isPulling.current = false
      setPullDistance(0)
      return
    }
    if (homeRef.current && homeRef.current.scrollTop > 0) {
      isPulling.current = false
      setPullDistance(0)
      return
    }
    const delta = e.touches[0].clientY - pullStartY.current
    if (delta <= 0) {
      isPulling.current = false
      setPullDistance(0)
      return
    }
    setPullDistance(Math.min(delta * 0.45, PULL_THRESHOLD + 25))
  }

  const handleTouchEnd = () => {
    if (!isPulling.current) return
    isPulling.current = false
    const triggered = pullDistance >= PULL_THRESHOLD
    setPullDistance(0)
    if (!triggered || viewModeRef.current !== 'home') return
    mediumHaptic()
    void collection.reloadData()
  }

  const applyQueryToFilters = (query: string) => {
    const trimmed = query.trim()

    if (!trimmed) {
      handleResetAll()
      return
    }

    collection.clearFilters()

    const parsed = parseQuery(trimmed)

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
      parsed.colors.forEach((c) => {
        if (c in newFilters) {
          newFilters[c as keyof typeof newFilters] = true
        }
      })
      collection.setColorFilters(newFilters)
    }

    if (parsed.identity && parsed.identity.length > 0) {
      const newFilters = { W: false, U: false, B: false, R: false, G: false, C: false }
      parsed.identity.forEach((c) => {
        if (c in newFilters) {
          newFilters[c as keyof typeof newFilters] = true
        }
      })
      collection.setColorIdentityFilters(newFilters)
    }

    if (parsed.rarity && parsed.rarity.length > 0) {
      const newFilters = { mythic: false, rare: false, uncommon: false, common: false }
      parsed.rarity.forEach((r) => {
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

    const firstStat = parsed.cmc ?? parsed.power ?? parsed.toughness
    if (firstStat) {
      const statType: StatType = parsed.cmc ? 'cmc' : parsed.power ? 'power' : 'toughness'
      collection.setStatType(statType)
      collection.setStatOperator(firstStat.operator as StatOperator)
      collection.setStatValue(String(firstStat.value))
    }
  }

  const handleQuerySearch = (query: string) => {
    mediumHaptic()
    setSearchQuery(query)
    setSubmittedQuery(query)
    applyQueryToFilters(query)
    setViewModeWithHistory('results')
  }

  if (collection.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="state-panel p-8 sm:p-10 text-center max-w-md w-full animate-fade-in">
          <div
            className="inline-block w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }}
          />
          <h2 className="text-xl font-semibold mb-2">Caricamento collezione</h2>
          <p className="text-sm" style={{ color: 'var(--color-gray-300)' }}>
            Sincronizzazione dati in corso dal Gist.
          </p>
        </div>
      </div>
    )
  }

  if (collection.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="state-panel p-8 rounded-xl max-w-md w-full text-center animate-fade-in">
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-xl font-bold"
            style={{
              background: 'rgba(220, 38, 38, 0.15)',
              color: 'var(--color-error-500)',
              border: '1px solid rgba(220, 38, 38, 0.35)'
            }}
            aria-hidden="true"
          >
            ER
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-error-500)' }}>
            Errore di caricamento
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
            {collection.error}
          </p>
          <p className="text-xs mt-4" style={{ color: 'var(--color-gray-500)' }}>
            Impossibile caricare i dati dal GitHub Gist. Verifica che il Gist contenga dati aggiornati.
          </p>
          <button
            onClick={() => void collection.reloadData()}
            className="mt-5 text-sm px-4 py-2 rounded-lg transition-colors hover:bg-white/10 touch-target press-feedback"
            style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'var(--color-accent-400)' }}
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!collection.data) {
    return null
  }

  const stats = collection.data.stats

  return (
    <>
      {/* ── HOME — full-screen hero, nessun header ── */}
      {viewMode === 'home' && (
        <div
          ref={homeRef}
          className="h-[100dvh] min-h-[100dvh] flex items-center justify-center p-5 sm:p-8 overflow-x-hidden overflow-y-auto relative"
          style={{
            paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {pullDistance > 0 && (
            <div
              className="absolute left-0 right-0 flex justify-center pointer-events-none"
              style={{ top: Math.max(0, pullDistance - 40), zIndex: 20 }}
            >
              <div
                className={pullDistance >= PULL_THRESHOLD ? 'animate-spin' : ''}
                style={{
                  width: 24, height: 24,
                  border: '2.5px solid var(--color-primary-500)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
                  transform: pullDistance < PULL_THRESHOLD ? `rotate(${(pullDistance / PULL_THRESHOLD) * 180}deg)` : undefined,
                }}
              />
            </div>
          )}
          {/* Gradient overlay bottom→top */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'var(--home-hero-overlay)',
              zIndex: 0,
            }}
            aria-hidden="true"
          />

          {/* Logo decorativo — sopra il gradiente, dietro il contenuto */}
          <div
            className="absolute pointer-events-none select-none"
            style={{ zIndex: 5, opacity: 0.09, top: '50%', left: '50%', transform: 'translate(-50%, -58%)' }}
            aria-hidden="true"
          >
            <AppLogo size={220} />
          </div>

          <div className="w-full max-w-lg space-y-6 animate-fade-in relative z-10">

            <div className="text-center space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Magic Collection</h1>
              <p className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
                {collection.data
                  ? `${collection.data.stats.total_cards.toLocaleString('it-IT')} carte nella collezione`
                  : 'Cerca e filtra la tua collezione.'}
              </p>
            </div>

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleQuerySearch}
              placeholder="Cerca nella collezione..."
              showSyntaxExamples={false}
              leading={<AppLogo size={22} />}
            />

            <div className="flex">
              <button
                onClick={goAdvanced}
                className="w-full btn-glass px-4 py-3 min-h-[48px] touch-target press-feedback flex items-center justify-center gap-2"
                style={{
                  backdropFilter: 'blur(24px) saturate(1.6)',
                  WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.22)',
                }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filtri Avanzati
              </button>
            </div>

            {dataSourceMeta && (
              <div className="flex flex-col items-center gap-1">
                <span className={`gist-chip ${isNonLiveSource ? 'warn' : 'live'}`}>
                  {dataSourceMeta.label}
                  {showStaleWarning && staleWarningMessage && `${staleWarningSeparator}${staleWarningMessage}`}
                </span>
                {(collection.data?.version || collection.data?.exported_at) && (
                  <p className="text-micro" style={{ color: 'var(--color-gray-600)' }}>
                    {collection.data?.version && `v${collection.data.version}`}
                    {collection.data?.version && collection.data?.exported_at && ' · '}
                    {collection.data?.exported_at &&
                      new Date(collection.data.exported_at).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── RESULTS / ADVANCED — top header persistente ── */}
      {viewMode !== 'home' && (
        <div className="h-[100dvh] min-h-[100dvh] overflow-hidden flex flex-col animate-fade-in">

          {/* Top header sticky */}
          <div className="app-header">
            <div className="p-3 space-y-2.5">

              {/* Riga 1: logo + SearchBar + hamburger — gruppo visivo unificato */}
              <div
                className="flex items-center glass rounded-xl"
                style={{ border: '1px solid var(--overlay-white-20)' }}
              >
                {/* Logo → home */}
                <button
                  type="button"
                  onClick={goHome}
                  className="flex-none press-feedback flex items-center pl-3 pr-2.5 self-stretch"
                  aria-label="Torna alla home"
                  style={{ background: 'none', border: 'none', boxShadow: 'none', color: navControlColor }}
                >
                  <AppLogo size={26} />
                </button>

                {/* Divisore verticale */}
                <div aria-hidden="true" style={{ width: 1, alignSelf: 'stretch', margin: '8px 0', background: 'var(--overlay-white-15)' }} />

                {/* SearchBar — senza proprio contenitore glass/border */}
                <div className="flex-1 min-w-0">
                  <SearchBar
                    bare
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleQuerySearch}
                    showSyntaxExamples={false}
                    placeholder="Cerca nella collezione..."
                  />
                </div>

                {/* Divisore verticale */}
                <div aria-hidden="true" style={{ width: 1, alignSelf: 'stretch', margin: '8px 0', background: 'var(--overlay-white-15)' }} />

                {/* Hamburger */}
                <div className="relative flex-none">
                  <button
                    ref={hamburgerRef}
                    onClick={() => { lightHaptic(); setIsNavDropdownOpen(v => !v) }}
                    className="flex items-center justify-center press-feedback self-stretch"
                    style={{ width: '2.75rem', alignSelf: 'stretch', minHeight: '2.75rem', boxShadow: 'none', background: 'none', color: navControlColor }}
                    aria-label="Menu navigazione"
                    aria-expanded={isNavDropdownOpen}
                  >
                    <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <NavDropdown
                    isOpen={isNavDropdownOpen}
                    anchorRef={hamburgerRef}
                    currentView={viewMode}
                    onNavigateResults={() => { setIsNavDropdownOpen(false); goResults() }}
                    onNavigateAdvanced={() => { setIsNavDropdownOpen(false); goAdvanced() }}
                    onClose={() => setIsNavDropdownOpen(false)}
                    theme={theme}
                    onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                  />
                </div>
              </div>


              {hasUnsupportedFields && (
                <div
                  className="px-3 py-2 rounded-lg text-xs"
                  style={{
                    border: '1px solid rgba(255, 193, 7, 0.25)',
                    background: 'rgba(255, 193, 7, 0.08)',
                    color: 'var(--color-warning-500)'
                  }}
                >
                  {unsupportedOnlyQuery
                    ? `Questa query usa filtri disponibili solo su Scryfall (${inlineScryfall.unsupportedFields.join(', ')}). Apri la query su Scryfall per il risultato completo.`
                    : `Alcuni filtri della query sono disponibili solo su Scryfall (${inlineScryfall.unsupportedFields.join(', ')}). I risultati mostrati qui sono parziali.`}
                </div>
              )}
            </div>
          </div>

          {/* Contenuto principale */}
          <main
            ref={mainRef}
            className={`flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 ${viewMode === 'results' ? 'custom-scrollbar' : ''}`}
            style={{
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y'
            }}
          >
            {viewMode === 'advanced' ? (
              <AdvancedFiltersPage
                stats={stats}
                filteredCount={displayedCards.length}
                activeFilterCount={totalActiveFilters}
                nameFilter={collection.nameFilter}
                textFilter={collection.textFilter}
                typeLineFilter={collection.typeLineFilter}
                colorFilters={collection.colorFilters}
                colorMode={collection.colorMode}
                colorIdentityFilters={collection.colorIdentityFilters}
                manaCostFilter={collection.manaCostFilter}
                manaCostExact={collection.manaCostExact}
                statType={collection.statType}
                statOperator={collection.statOperator}
                statValue={collection.statValue}
                tagFilter={collection.tagFilter}
                rarityFilters={collection.rarityFilters}
                allTags={collection.data.tags}
                onNameFilterChange={collection.setNameFilter}
                onTextFilterChange={collection.setTextFilter}
                onTypeLineFilterChange={collection.setTypeLineFilter}
                onColorFiltersChange={collection.setColorFilters}
                onColorModeChange={collection.setColorMode}
                onColorIdentityFiltersChange={collection.setColorIdentityFilters}
                onManaCostFilterChange={collection.setManaCostFilter}
                onManaCostExactChange={collection.setManaCostExact}
                onStatTypeChange={collection.setStatType}
                onStatOperatorChange={collection.setStatOperator}
                onStatValueChange={collection.setStatValue}
                onTagFilterChange={collection.setTagFilter}
                onRarityFiltersChange={collection.setRarityFilters}
                onClearFilters={handleClearFilters}
                onApply={goResults}
              />
            ) : (
              <>
                {totalActiveFilters === 0 && !submittedQuery.trim() ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="state-panel p-6 rounded-xl max-w-md text-center space-y-2">
                      <h3 className="text-xl font-semibold" style={{ color: 'var(--color-gray-100)' }}>Inizia con una ricerca</h3>
                      <p className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
                        Usa la barra in alto o apri la pagina filtri.
                      </p>
                    </div>
                  </div>
                ) : (
                  <CardGrid cards={displayedCards} />
                )}
              </>
            )}
          </main>

          {/* ── FAB Ordinamento ── */}
          {viewMode === 'results' && (
            <>
              {/* Overlay per chiudere il panel */}
              {isSortPanelOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSortPanelOpen(false)}
                />
              )}

              <div
                className="fixed right-4 z-50 flex flex-col items-end gap-2"
                style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
              >
                {/* Panel ordinamento */}
                {isSortPanelOpen && (
                  <div
                    className="rounded-xl overflow-hidden animate-fade-in"
                    style={{
                      background: 'var(--surface-dropdown)',
                      border: '1px solid var(--surface-border)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      minWidth: '11rem',
                      boxShadow: 'var(--shadow-lifted)',
                    }}
                  >
                    {/* Campi di ordinamento */}
                    <div className="p-1.5 space-y-0.5">
                      {([
                        { value: 'name', label: 'Nome' },
                        { value: 'rarity', label: 'Rarità' },
                        { value: 'cmc', label: 'CMC' },
                        { value: 'edition', label: 'Edizione' },
                        { value: 'quantity', label: 'Quantità' },
                      ] as { value: SortField; label: string }[]).map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => { lightHaptic(); collection.setSortField(value) }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm press-feedback transition-colors"
                          style={{
                            background: collection.sortField === value
                              ? 'rgba(var(--color-primary-rgb), 0.2)'
                              : 'transparent',
                            color: collection.sortField === value
                              ? 'var(--color-primary-200)'
                              : 'var(--color-gray-200)',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid var(--overlay-white-10)' }} />

                    {/* Toggle asc/desc */}
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          lightHaptic()
                          collection.setSortDirection(collection.sortDirection === 'asc' ? 'desc' : 'asc')
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm press-feedback sort-hover-btn transition-colors"
                        style={{ color: 'var(--color-gray-200)' }}
                      >
                        <span>{collection.sortDirection === 'asc' ? 'Crescente' : 'Decrescente'}</span>
                        <span className="text-base">{collection.sortDirection === 'asc' ? '↑' : '↓'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* FAB */}
                <button
                  onClick={() => { lightHaptic(); setIsSortPanelOpen((v) => !v) }}
                  className="w-12 h-12 rounded-full flex items-center justify-center press-feedback"
                  style={{
                    background: isSortPanelOpen
                      ? 'rgba(var(--color-primary-rgb), 0.75)'
                      : 'rgba(var(--color-primary-rgb), 0.55)',
                    border: '1px solid var(--color-primary-500)',
                    color: 'var(--color-primary-200)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: 'var(--shadow-panel)',
                  }}
                  aria-label="Ordinamento carte"
                  aria-expanded={isSortPanelOpen}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
