import type { RarityFilters } from '../../types'
import { CustomSelect } from '../ui/CustomSelect'

interface RaritySetFilterProps {
  rarityFilters: RarityFilters
  tagFilter: string
  allTags: string[]
  onRarityFiltersChange: (filters: RarityFilters) => void
  onTagFilterChange: (value: string) => void
}

const RARITIES = [
  { key: 'mythic' as const, name: 'Mythic', color: 'var(--rarity-mythic)', bg: 'var(--rarity-mythic-bg)' },
  { key: 'rare' as const, name: 'Rare', color: 'var(--rarity-rare)', bg: 'var(--rarity-rare-bg)' },
  { key: 'uncommon' as const, name: 'Uncommon', color: 'var(--rarity-uncommon)', bg: 'var(--rarity-uncommon-bg)' },
  { key: 'common' as const, name: 'Common', color: 'var(--rarity-common)', bg: 'var(--rarity-common-bg)' }
]

export function RaritySetFilter({
  rarityFilters,
  tagFilter,
  allTags,
  onRarityFiltersChange,
  onTagFilterChange
}: RaritySetFilterProps) {
  return (
    <div className="space-y-3">
      <div>
        <label id="rarity-group-label" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-gray-100)' }}>
          Rarità
        </label>
        <div role="group" aria-labelledby="rarity-group-label" className="grid grid-cols-4 gap-1.5">
          {RARITIES.map(({ key, name, color, bg }) => (
            <button
              key={key}
              onClick={() => onRarityFiltersChange({ ...rarityFilters, [key]: !rarityFilters[key] })}
              aria-pressed={rarityFilters[key]}
              className="px-2 py-1 rounded-md text-micro font-semibold transition-all duration-200 flex items-center justify-center min-h-0 h-10 press-feedback"
              style={{
                backgroundColor: rarityFilters[key] ? bg : 'var(--overlay-white-5)',
                border: `1px solid ${rarityFilters[key] ? color : 'var(--overlay-white-10)'}`,
                color: rarityFilters[key] ? color : 'var(--color-gray-400)'
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {allTags.length > 0 && (
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-gray-100)' }}>
            Tag
          </label>
          <CustomSelect
            value={tagFilter}
            onChange={onTagFilterChange}
            options={[
              { value: '', label: 'Tutti i tag' },
              ...allTags.map((tag) => ({ value: tag, label: tag }))
            ]}
            aria-label="Seleziona tag"
          />
        </div>
      )}
    </div>
  )
}
