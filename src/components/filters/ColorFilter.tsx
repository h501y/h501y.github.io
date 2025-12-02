import type { ColorFilters, ColorMode } from '../../types'

interface ColorFilterProps {
  colorFilters: ColorFilters
  colorMode: ColorMode
  colorIdentityFilters: ColorFilters
  onColorFiltersChange: (filters: ColorFilters) => void
  onColorModeChange: (mode: ColorMode) => void
  onColorIdentityFiltersChange: (filters: ColorFilters) => void
}

const COLORS = [
  { key: 'W' as const, name: 'Bianco', color: 'var(--mana-white)', textColor: '#000' },
  { key: 'U' as const, name: 'Blu', color: 'var(--mana-blue)', textColor: '#fff' },
  { key: 'B' as const, name: 'Nero', color: 'var(--mana-black)', textColor: '#fff' },
  { key: 'R' as const, name: 'Rosso', color: 'var(--mana-red)', textColor: '#fff' },
  { key: 'G' as const, name: 'Verde', color: 'var(--mana-green)', textColor: '#fff' },
  { key: 'C' as const, name: 'Incolore', color: 'var(--mana-colorless)', textColor: '#000' }
]

export function ColorFilter({
  colorFilters,
  colorMode,
  colorIdentityFilters,
  onColorFiltersChange,
  onColorModeChange,
  onColorIdentityFiltersChange
}: ColorFilterProps) {
  return (
    <div className="space-y-4">
      {/* Color filters */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-gray-400)' }}>
          Colori
        </label>
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map(({ key, name, color, textColor }) => (
            <button
              key={key}
              onClick={() => onColorFiltersChange({ ...colorFilters, [key]: !colorFilters[key] })}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: colorFilters[key] ? color : 'rgba(255, 255, 255, 0.05)',
                color: colorFilters[key] ? textColor : 'var(--color-gray-300)',
                border: `1px solid ${colorFilters[key] ? color : 'rgba(255, 255, 255, 0.1)'}`
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Color mode */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-gray-400)' }}>
          Modalità
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['exactly', 'including', 'at_most'] as ColorMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onColorModeChange(mode)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: colorMode === mode ? 'rgba(var(--color-primary-rgb), 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${colorMode === mode ? 'var(--color-primary-500)' : 'rgba(255, 255, 255, 0.1)'}`,
                color: colorMode === mode ? 'var(--color-primary-200)' : 'var(--color-gray-400)'
              }}
            >
              {mode === 'exactly' ? 'Esatto' : mode === 'including' ? 'Include' : 'Almeno'}
            </button>
          ))}
        </div>
      </div>

      {/* Commander Identity */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-gray-400)' }}>
          Commander Identity
        </label>
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map(({ key, name, color, textColor }) => (
            <button
              key={key}
              onClick={() => onColorIdentityFiltersChange({ ...colorIdentityFilters, [key]: !colorIdentityFilters[key] })}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: colorIdentityFilters[key] ? color : 'rgba(255, 255, 255, 0.05)',
                color: colorIdentityFilters[key] ? textColor : 'var(--color-gray-300)',
                border: `1px solid ${colorIdentityFilters[key] ? color : 'rgba(255, 255, 255, 0.1)'}`
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
