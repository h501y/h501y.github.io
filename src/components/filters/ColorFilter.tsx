import type { ColorFilters, ColorMode } from '../../types'
import { CustomSelect } from '../ui/CustomSelect'

interface ColorFilterProps {
  colorFilters: ColorFilters
  colorMode: ColorMode
  colorIdentityFilters: ColorFilters
  onColorFiltersChange: (filters: ColorFilters) => void
  onColorModeChange: (mode: ColorMode) => void
  onColorIdentityFiltersChange: (filters: ColorFilters) => void
}

const COLORS = [
  { key: 'W' as const, name: 'Bianco' },
  { key: 'U' as const, name: 'Blu' },
  { key: 'B' as const, name: 'Nero' },
  { key: 'R' as const, name: 'Rosso' },
  { key: 'G' as const, name: 'Verde' },
  { key: 'C' as const, name: 'Incolore' }
]

const MANA_SYMBOLS: Record<(typeof COLORS)[number]['key'], string> = {
  W: 'https://svgs.scryfall.io/card-symbols/W.svg',
  U: 'https://svgs.scryfall.io/card-symbols/U.svg',
  B: 'https://svgs.scryfall.io/card-symbols/B.svg',
  R: 'https://svgs.scryfall.io/card-symbols/R.svg',
  G: 'https://svgs.scryfall.io/card-symbols/G.svg',
  C: 'https://svgs.scryfall.io/card-symbols/C.svg'
}

const COLOR_MODE_OPTIONS = [
  { value: 'exactly',   label: 'Esatto — solo questi colori' },
  { value: 'including', label: 'Include — almeno questi' },
  { value: 'at_most',   label: 'Al massimo — non più di questi' },
]

const COLOR_MODE_DESCRIPTIONS: Record<ColorMode, string> = {
  exactly:   'Mostra carte con esattamente questi colori.',
  including: 'Mostra carte che includono almeno questi colori.',
  at_most:   'Mostra carte con al massimo questi colori (incluse incolori).',
}

function ColorCheckItem({
  selected,
  symbol,
  label,
  onClick
}: {
  selected: boolean
  symbol: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className="flex items-center gap-2 px-2.5 rounded-lg transition-all duration-200 press-feedback"
      style={{
        height: '40px',
        backgroundColor: selected ? 'rgba(var(--color-primary-rgb), 0.22)' : 'var(--overlay-white-5)',
        border: `1px solid ${selected ? 'var(--color-primary-500)' : 'var(--overlay-white-14)'}`,
        color: selected ? 'var(--color-primary-200)' : 'var(--color-gray-300)',
      }}
    >
      <img src={symbol} alt="" aria-hidden="true" className="w-5 h-5 flex-shrink-0" loading="lazy" decoding="async" />
      <span className="text-xs font-medium truncate">{label}</span>
    </button>
  )
}

export function ColorFilter({
  colorFilters,
  colorMode,
  colorIdentityFilters,
  onColorFiltersChange,
  onColorModeChange,
  onColorIdentityFiltersChange
}: ColorFilterProps) {
  return (
    <div className="space-y-3">
      <div>
        <label id="color-filter-label" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-gray-100)' }}>
          Colori e Modalità
        </label>
        <div role="group" aria-labelledby="color-filter-label" className="grid grid-cols-3 gap-2">
          {COLORS.map(({ key, name }) => (
            <ColorCheckItem
              key={key}
              selected={colorFilters[key]}
              symbol={MANA_SYMBOLS[key]}
              label={name}
              onClick={() => onColorFiltersChange({ ...colorFilters, [key]: !colorFilters[key] })}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="space-y-1.5">
          <CustomSelect
            value={colorMode}
            onChange={(v) => onColorModeChange(v as ColorMode)}
            options={COLOR_MODE_OPTIONS}
            aria-label="Modalità colore"
          />
          <p className="text-micro" style={{ color: 'var(--color-gray-500)' }}>
            {COLOR_MODE_DESCRIPTIONS[colorMode]}
          </p>
        </div>
      </div>

      <div>
        <label id="identity-filter-label" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-gray-100)' }}>
          Commander Identity
        </label>
        <div role="group" aria-labelledby="identity-filter-label" className="grid grid-cols-3 gap-2">
          {COLORS.map(({ key, name }) => (
            <ColorCheckItem
              key={key}
              selected={colorIdentityFilters[key]}
              symbol={MANA_SYMBOLS[key]}
              label={name}
              onClick={() => onColorIdentityFiltersChange({ ...colorIdentityFilters, [key]: !colorIdentityFilters[key] })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
