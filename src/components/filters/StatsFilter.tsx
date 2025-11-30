import type { StatType, StatOperator } from '../../types'

interface StatsFilterProps {
  manaCostFilter: string
  statType: StatType
  statOperator: StatOperator
  statValue: string
  onManaCostFilterChange: (value: string) => void
  onStatTypeChange: (type: StatType) => void
  onStatOperatorChange: (operator: StatOperator) => void
  onStatValueChange: (value: string) => void
}

export function StatsFilter({
  manaCostFilter,
  statType,
  statOperator,
  statValue,
  onManaCostFilterChange,
  onStatTypeChange,
  onStatOperatorChange,
  onStatValueChange
}: StatsFilterProps) {
  return (
    <div className="space-y-4">
      {/* Mana cost filter */}
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-gray-400)' }}>
          Costo di Mana
        </label>
        <input
          type="text"
          value={manaCostFilter}
          onChange={(e) => onManaCostFilterChange(e.target.value)}
          placeholder="es: {2}{U}{U}"
          className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: 'var(--color-primary-500)' }}
        />
      </div>

      {/* Stat filters */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-gray-400)' }}>
          Statistiche
        </label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {(['cmc', 'power', 'toughness'] as StatType[]).map((type) => (
            <button
              key={type}
              onClick={() => onStatTypeChange(type)}
              className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: statType === type ? 'rgba(var(--color-primary-rgb), 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${statType === type ? 'var(--color-primary-500)' : 'rgba(255, 255, 255, 0.1)'}`,
                color: statType === type ? 'var(--color-primary-200)' : 'var(--color-gray-400)'
              }}
            >
              {type === 'cmc' ? 'CMC' : type === 'power' ? 'POW' : 'TOU'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            value={statOperator}
            onChange={(e) => onStatOperatorChange(e.target.value as StatOperator)}
            className="px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: 'var(--color-primary-500)' }}
          >
            <option value="=">=</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value=">=">&gt;=</option>
            <option value="<=">&lt;=</option>
          </select>

          <input
            type="text"
            value={statValue}
            onChange={(e) => onStatValueChange(e.target.value)}
            placeholder="Valore"
            className="flex-1 px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: 'var(--color-primary-500)' }}
          />
        </div>
      </div>
    </div>
  )
}
