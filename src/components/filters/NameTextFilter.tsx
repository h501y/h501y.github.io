interface NameTextFilterProps {
  nameFilter: string
  textFilter: string
  onNameFilterChange: (value: string) => void
  onTextFilterChange: (value: string) => void
  textHelperText?: string
}

export function NameTextFilter({
  nameFilter,
  textFilter,
  onNameFilterChange,
  onTextFilterChange,
  textHelperText,
}: NameTextFilterProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-gray-100)' }}>
          Nome
        </label>
        <input
          type="text"
          value={nameFilter}
          onChange={(e) => onNameFilterChange(e.target.value)}
          placeholder='es. "Goblin", "Lightning Bolt"...'
          className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: 'var(--color-primary-500)' }}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-gray-100)' }}>
          Testo Oracle
        </label>
        <input
          type="text"
          value={textFilter}
          onChange={(e) => onTextFilterChange(e.target.value)}
          placeholder='cerca solo testo in inglese...'
          className="w-full px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: 'var(--color-primary-500)' }}
        />
        {textHelperText && (
          <p className="text-micro mt-1" style={{ color: 'var(--color-gray-500)' }}>
            {textHelperText}
          </p>
        )}
      </div>
    </div>
  )
}
