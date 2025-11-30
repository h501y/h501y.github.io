interface NameTextFilterProps {
  nameFilter: string
  textFilter: string
  onNameFilterChange: (value: string) => void
  onTextFilterChange: (value: string) => void
}

export function NameTextFilter({
  nameFilter,
  textFilter,
  onNameFilterChange,
  onTextFilterChange
}: NameTextFilterProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-gray-400)' }}>
          Nome
        </label>
        <input
          type="text"
          value={nameFilter}
          onChange={(e) => onNameFilterChange(e.target.value)}
          placeholder="Cerca per nome..."
          className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: 'var(--color-primary-500)' }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-gray-400)' }}>
          Testo Oracolo
        </label>
        <input
          type="text"
          value={textFilter}
          onChange={(e) => onTextFilterChange(e.target.value)}
          placeholder="Cerca nel testo..."
          className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: 'var(--color-primary-500)' }}
        />
      </div>
    </div>
  )
}
