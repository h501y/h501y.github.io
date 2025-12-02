import { useState, useEffect, useRef } from 'react'

export interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = 'Cerca carte...' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const debounceTimerRef = useRef<number | null>(null)

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for debounced search
    debounceTimerRef.current = window.setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim())
      }
    }, 300) // 300ms debounce

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, onSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleClear = () => {
    setQuery('')
  }

  return (
    <div className="w-full">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative glass rounded-xl overflow-hidden">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-24 bg-transparent border-none outline-none text-white placeholder-gray-400"
            style={{ fontSize: '16px' }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--color-accent-500)',
                opacity: query.trim() ? 1 : 0.5
              }}
              disabled={!query.trim()}
              aria-label="Search"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      {/* Syntax Examples */}
      <div className="mt-4 space-y-2 text-sm text-gray-400">
        <p className="font-semibold" style={{ color: 'var(--color-gray-300)' }}>
          💡 Esempi di sintassi:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="glass rounded-lg p-3">
            <span className="text-gray-500">Scryfall-style:</span>
            <code className="block mt-1 text-xs" style={{ color: 'var(--color-accent-400)' }}>
              c:r t:creature cmc&gt;=3
            </code>
          </div>
          <div className="glass rounded-lg p-3">
            <span className="text-gray-500">Verboso:</span>
            <code className="block mt-1 text-xs" style={{ color: 'var(--color-accent-400)' }}>
              color:red type:creature mana&gt;=3
            </code>
          </div>
          <div className="glass rounded-lg p-3">
            <span className="text-gray-500">Nome e set:</span>
            <code className="block mt-1 text-xs" style={{ color: 'var(--color-accent-400)' }}>
              name:swamp set:M21
            </code>
          </div>
          <div className="glass rounded-lg p-3">
            <span className="text-gray-500">Power/Toughness:</span>
            <code className="block mt-1 text-xs" style={{ color: 'var(--color-accent-400)' }}>
              pow&gt;=5 tou&lt;=3
            </code>
          </div>
        </div>
        <div className="text-xs mt-3 space-y-1">
          <p>
            <strong style={{ color: 'var(--color-gray-300)' }}>Filtri:</strong> name (n), color (c), type (t), rarity (r), set (s), cmc/mana, power (pow), toughness (tou), text (o), tag, identity (id)
          </p>
          <p>
            <strong style={{ color: 'var(--color-gray-300)' }}>Operatori:</strong> : (uguale), &gt; (maggiore), &lt; (minore), &gt;= (maggiore/uguale), &lt;= (minore/uguale)
          </p>
        </div>
      </div>
    </div>
  )
}
