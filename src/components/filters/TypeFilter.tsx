interface TypeFilterProps {
  typeLineFilter: string
  onTypeLineFilterChange: (value: string) => void
}

export function TypeFilter({
  typeLineFilter,
  onTypeLineFilterChange
}: TypeFilterProps) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-gray-400)' }}>
        Tipo
      </label>
      <input
        type="text"
        value={typeLineFilter}
        onChange={(e) => onTypeLineFilterChange(e.target.value)}
        placeholder="es: Creature, Instant, Land..."
        className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
        style={{ borderColor: 'var(--color-primary-500)' }}
      />
      <p className="text-xs mt-1" style={{ color: 'var(--color-gray-500)' }}>
        Cerca per tipo di carta
      </p>
    </div>
  )
}
