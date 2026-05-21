import { useMemo, useState } from 'react'

interface TypeFilterProps {
  typeLineFilter: string
  onTypeLineFilterChange: (value: string) => void
}

type TokenMode = 'include' | 'exclude'

interface TypeToken {
  token: string
  mode: TokenMode
}

const ALL_TYPES = [
  'legendary', 'basic', 'snow', 'world',
  'artifact', 'battle', 'creature', 'enchantment', 'instant', 'kindred', 'land', 'planeswalker', 'sorcery',
  'equipment', 'vehicle',
  'aura', 'background', 'class', 'saga', 'shard'
]

function parseTokens(value: string): TypeToken[] {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) =>
      t.startsWith('-')
        ? { token: t.slice(1), mode: 'exclude' as TokenMode }
        : { token: t, mode: 'include' as TokenMode }
    )
}

function buildFilter(tokens: TypeToken[]): string {
  return tokens
    .map(({ token, mode }) => (mode === 'exclude' ? `-${token}` : token))
    .join(' ')
}

export function TypeFilter({ typeLineFilter, onTypeLineFilterChange }: TypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const tokens = useMemo(() => parseTokens(typeLineFilter), [typeLineFilter])
  const selectedSet = useMemo(() => new Set(tokens.map((t) => t.token)), [tokens])

  const filteredTypes = useMemo(() => {
    const q = search.toLowerCase().trim()
    const available = ALL_TYPES.filter((t) => !selectedSet.has(t))
    if (!q) return available
    return available.filter((t) => t.includes(q))
  }, [search, selectedSet])

  const addToken = (token: string) => {
    const normalized = token.trim().toLowerCase()
    if (!normalized || selectedSet.has(normalized)) return
    onTypeLineFilterChange(buildFilter([...tokens, { token: normalized, mode: 'include' }]))
    setSearch('')
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = search.trim().toLowerCase()
      if (!q || selectedSet.has(q)) return
      addToken(q)
      e.preventDefault()
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const toggleToken = (tokenStr: string) => {
    const newTokens = tokens
      .map((t): TypeToken | null => {
        if (t.token !== tokenStr) return t
        if (t.mode === 'include') return { token: t.token, mode: 'exclude' }
        return null
      })
      .filter((t): t is TypeToken => t !== null)
    onTypeLineFilterChange(buildFilter(newTokens))
  }

  return (
    <div className="space-y-2">
      {/* Header row con reset */}
      {tokens.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onTypeLineFilterChange('')}
            className="px-2 py-1 rounded-md text-micro min-h-0 h-8 press-feedback"
            style={{ border: '1px solid var(--overlay-white-20)', color: 'var(--color-gray-300)' }}
          >
            Reset tipo
          </button>
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg glass hover:bg-white/10 transition-colors press-feedback"
        style={{ border: '1px solid var(--overlay-white-20)' }}
        aria-expanded={isOpen}
        aria-label="Apri selezione tipi"
      >
        <span className="text-xs" style={{ color: 'var(--color-gray-200)' }}>
          Tipi rapidi{tokens.length > 0 ? ` (${tokens.length})` : ''}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--color-gray-300)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Scrollable dropdown */}
      {isOpen && (
        <div
          className="rounded-lg animate-fade-in overflow-hidden"
          style={{ border: '1px solid var(--overlay-white-14)', background: 'var(--surface-dropdown)' }}
        >
          {/* Search input */}
          <div className="p-2" style={{ borderBottom: '1px solid var(--overlay-white-10)' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Cerca o scrivi tipo..."
              aria-label="Cerca tipo di carta"
              className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none"
              style={{ border: '1px solid var(--overlay-white-20)', fontSize: '16px' }}
              autoComplete="off"
            />
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto p-1.5 space-y-0.5" style={{ maxHeight: '11rem' }}>
            {filteredTypes.length > 0 ? (
              filteredTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addToken(type)}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors press-feedback"
                  style={{ color: 'var(--color-gray-200)' }}
                >
                  {type}
                </button>
              ))
            ) : search.trim() ? (
              <button
                type="button"
                onClick={() => addToken(search.trim())}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-white/10 press-feedback"
                style={{ color: 'var(--color-accent-400)' }}
              >
                + Aggiungi &ldquo;{search.trim()}&rdquo;
              </button>
            ) : (
              <p className="px-3 py-2 text-xs" style={{ color: 'var(--color-gray-500)' }}>
                Tutti i tipi già selezionati
              </p>
            )}
          </div>
        </div>
      )}

      {/* Chips */}
      {tokens.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tokens.map(({ token, mode }) => (
            <button
              key={token}
              type="button"
              onClick={() => toggleToken(token)}
              aria-label={`Tipo ${token}: ${mode === 'include' ? 'incluso, clicca per escludere' : 'escluso, clicca per rimuovere'}`}
              className="px-2 py-1 rounded-md text-micro font-semibold flex items-center gap-1 press-feedback transition-all duration-200"
              style={{
                background: mode === 'include' ? 'var(--chip-include-bg)' : 'var(--chip-exclude-bg)',
                border: `1px solid ${mode === 'include' ? 'var(--chip-include-border)' : 'var(--chip-exclude-border)'}`,
                color: mode === 'include' ? 'var(--chip-include-color)' : 'var(--chip-exclude-color)'
              }}
            >
              <span>{mode === 'include' ? '+' : '−'}</span>
              {token}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
