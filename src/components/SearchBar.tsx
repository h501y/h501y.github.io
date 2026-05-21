import { useState } from 'react'
import type { ReactNode } from 'react'

export interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  value?: string
  onChange?: (query: string) => void
  showSyntaxExamples?: boolean
  leading?: ReactNode
  bare?: boolean
}

export function SearchBar({
  onSearch,
  placeholder = '',
  value,
  onChange,
  showSyntaxExamples = true,
  leading,
  bare = false,
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState('')
  const isControlled = typeof value === 'string'
  const query = isControlled ? value : internalQuery

  const setQuery = (next: string) => {
    if (!isControlled) {
      setInternalQuery(next)
    }
    onChange?.(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      onSearch(trimmed)
    }
  }

  const handleClear = () => {
    setQuery('')
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={bare ? 'relative searchbar-root' : 'relative glass rounded-xl overflow-hidden border searchbar-root'} style={bare ? undefined : { borderColor: 'var(--overlay-white-20)' }}>
          {leading && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none searchbar-logo"
            >
              {leading}
            </div>
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder || 'Ricerca carte'}
            className={`w-full ${leading ? 'pl-10' : 'px-4'} py-3.5 ${query ? 'pr-12' : 'pr-4'} bg-transparent border-none outline-none touch-target`}
            style={{ fontSize: '16px', ...(bare ? { boxShadow: 'none', outline: 'none' } : {}) }}
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors touch-target press-feedback"
                aria-label="Cancella ricerca"
              >
                <svg className="w-5 h-5" style={{ color: 'var(--color-gray-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </form>

      {showSyntaxExamples && (
        <div className="mt-3 text-xs" style={{ color: 'var(--color-gray-500)' }}>
          <div className="flex flex-wrap gap-2 justify-center">
            {(['is:promo', 'art:dragon', 'c:r t:creature cmc>=3'] as const).map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => { setQuery(ex); onSearch(ex) }}
                className="glass rounded px-2 py-1 press-feedback"
                style={{ color: 'var(--color-accent-400)', fontFamily: 'monospace' }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
