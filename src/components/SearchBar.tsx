import { useState } from 'react'

export interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = 'Cerca carte...' }: SearchBarProps) {
  const [query, setQuery] = useState('')

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
            autoComplete="off"
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
      <div className="mt-3 text-xs text-gray-400">
        <div className="flex flex-wrap gap-2 justify-center">
          <code className="glass rounded px-2 py-1" style={{ color: 'var(--color-accent-400)' }}>Lightning Bolt</code>
          <code className="glass rounded px-2 py-1" style={{ color: 'var(--color-accent-400)' }}>Jace c:u</code>
          <code className="glass rounded px-2 py-1" style={{ color: 'var(--color-accent-400)' }}>c:r t:creature cmc&gt;=3</code>
        </div>
      </div>
    </div>
  )
}
