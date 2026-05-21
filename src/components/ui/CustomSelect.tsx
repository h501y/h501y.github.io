import { useEffect, useRef, useState } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
  'aria-label'?: string
}

const ESTIMATED_MAX_H = 280 // px — matches maxHeight style below

export function CustomSelect({ value, onChange, options, className = '', 'aria-label': ariaLabel }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value

  // Close on outside click or touch
  useEffect(() => {
    if (!isOpen) return
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside as EventListener, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside as EventListener)
    }
  }, [isOpen])

  // Scroll to the selected option when the panel opens
  useEffect(() => {
    if (isOpen) {
      selectedRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom
        setOpenUpward(spaceBelow < ESTIMATED_MAX_H && rect.top > spaceBelow)
      }
    }
    setIsOpen((open) => !open)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg glass text-sm press-feedback"
        style={{ border: '1px solid var(--overlay-white-20)', color: 'var(--color-gray-200)' }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--color-gray-400)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-[200] w-full rounded-lg py-1 animate-fade-in overflow-y-auto custom-scrollbar"
          style={{
            maxHeight: `${ESTIMATED_MAX_H}px`,
            top: openUpward ? 'auto' : 'calc(100% + 4px)',
            bottom: openUpward ? 'calc(100% + 4px)' : 'auto',
            background: 'var(--surface-dropdown)',
            border: '1px solid var(--overlay-white-14)',
            boxShadow: 'var(--shadow-panel)',
          }}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                ref={isSelected ? selectedRef : undefined}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm transition-colors press-feedback"
                style={{
                  background: isSelected ? 'rgba(var(--color-primary-rgb), 0.2)' : 'transparent',
                  color: isSelected ? 'var(--color-primary-200)' : 'var(--color-gray-200)',
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
