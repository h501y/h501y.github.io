import type { RarityFilters, CardSet } from '../../types'

interface RaritySetFilterProps {
  rarityFilters: RarityFilters
  setFilter: string
  tagFilter: string
  allSets: CardSet[]
  allTags: string[]
  rarityStats: Record<string, number>
  onRarityFiltersChange: (filters: RarityFilters) => void
  onSetFilterChange: (value: string) => void
  onTagFilterChange: (value: string) => void
}

const RARITIES = [
  { key: 'mythic' as const, name: 'Mythic', color: 'var(--rarity-mythic)' },
  { key: 'rare' as const, name: 'Rare', color: 'var(--rarity-rare)' },
  { key: 'uncommon' as const, name: 'Uncommon', color: 'var(--rarity-uncommon)' },
  { key: 'common' as const, name: 'Common', color: 'var(--rarity-common)' }
]

export function RaritySetFilter({
  rarityFilters,
  setFilter,
  tagFilter,
  allSets,
  allTags,
  rarityStats,
  onRarityFiltersChange,
  onSetFilterChange,
  onTagFilterChange
}: RaritySetFilterProps) {
  return (
    <div className="space-y-4">
      {/* Rarity filters */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-gray-400)' }}>
          Rarità
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RARITIES.map(({ key, name, color }) => (
            <button
              key={key}
              onClick={() => onRarityFiltersChange({ ...rarityFilters, [key]: !rarityFilters[key] })}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-between"
              style={{
                backgroundColor: rarityFilters[key] ? `${color}20` : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${rarityFilters[key] ? (key === 'common' ? '#ffffff' : color) : 'rgba(255, 255, 255, 0.1)'}`,
                color: rarityFilters[key] ? (key === 'common' ? '#ffffff' : color) : 'var(--color-gray-400)'
              }}
            >
              <span>{name}</span>
              <span className="text-xs opacity-70">
                {rarityStats[key] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Set filter */}
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-gray-400)' }}>
          Espansione
        </label>
        <select
          value={setFilter}
          onChange={(e) => onSetFilterChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: 'var(--color-primary-500)' }}
        >
          <option value="">Tutte le espansioni</option>
          {allSets.map((set) => (
            <option key={set.set_code} value={set.set_code}>
              {set.set_name} ({set.set_code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-gray-400)' }}>
            Tag
          </label>
          <select
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: 'var(--color-primary-500)' }}
          >
            <option value="">Tutti i tag</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
