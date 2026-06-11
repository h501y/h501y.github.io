import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCollectionData } from './hooks/useCollectionData'
import { CollectionTable } from './components/CollectionTable'
import { SearchBar } from './components/SearchBar'
import { AppLogo } from './components/AppLogo'
import {
  filterAndSortCards,
  type SortDirection,
  type SortField
} from './utils/searchCards'

type Theme = 'dark' | 'light'

// Field and direction live in one state: deciding the next direction
// depends on the previous field, so a single pure updater can compute
// both. Two chained setState updaters would be impure (StrictMode
// double-invokes updaters in dev, cancelling the asc/desc toggle).
interface SortState {
  field: SortField
  direction: SortDirection
}

function readInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme')
    if (attr === 'light' || attr === 'dark') return attr
  }
  return 'dark'
}

export default function App() {
  const { data, isLoading, error, dataSource, reloadData } = useCollectionData()

  const [theme, setTheme] = useState<Theme>(readInitialTheme)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState>({ field: 'name', direction: 'asc' })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('mc-theme', theme)
    } catch {
      // private mode — DOM is already updated, ignore persistence failure
    }
  }, [theme])

  const cards = useMemo(() => {
    if (!data) return []
    return filterAndSortCards(data.cards, query, sort.field, sort.direction)
  }, [data, query, sort])

  const handleChangeSort = useCallback((field: SortField) => {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      // Sensible defaults per column: name asc (A→Z), qty desc (most copies first),
      // rarity desc (mythic first).
      return { field, direction: field === 'name' ? 'asc' : 'desc' }
    })
  }, [])

  if (isLoading && !data) {
    return (
      <div className="viewer-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div
            className="inline-block animate-spin"
            style={{
              width: 40,
              height: 40,
              border: '3px solid var(--color-primary-500)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              marginBottom: '1rem'
            }}
          />
          <p style={{ color: 'var(--color-gray-400)', fontSize: '0.9rem' }}>
            Caricamento collezione…
          </p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="viewer-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="state-panel" style={{ padding: '1.5rem 2rem', maxWidth: 380, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-error-500)', marginBottom: '0.5rem' }}>
            Caricamento fallito
          </h2>
          <p style={{ color: 'var(--color-gray-400)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </p>
          <button
            onClick={() => void reloadData()}
            className="btn-glass"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const isOffline = dataSource === 'cache'
  const lastUpdatedLabel = data.exported_at
    ? new Date(data.exported_at).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  return (
    <div className="viewer-shell">
      <div className="viewer-topbar">
        <div className="viewer-search-slot">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={() => undefined}
            placeholder="Cerca per nome…"
            showSyntaxExamples={false}
            leading={<AppLogo size={20} />}
          />
        </div>
        <button
          type="button"
          className="viewer-theme-toggle"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          aria-label={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>

      <div className="viewer-status" data-offline={isOffline || undefined}>
        <span>
          {cards.length === data.cards.length
            ? `${data.cards.length.toLocaleString('it-IT')} carte`
            : `${cards.length.toLocaleString('it-IT')} / ${data.cards.length.toLocaleString('it-IT')} carte`}
        </span>
        <span>
          {isOffline
            ? `Offline · ultimo aggiornamento ${lastUpdatedLabel ?? '—'}`
            : lastUpdatedLabel
              ? `Aggiornato ${lastUpdatedLabel}`
              : ''}
        </span>
      </div>

      <CollectionTable
        cards={cards}
        sortField={sort.field}
        sortDirection={sort.direction}
        onChangeSort={handleChangeSort}
      />
    </div>
  )
}
