import { useState, ReactNode } from 'react'

interface AccordionProps {
  title: string
  defaultOpen?: boolean
  badge?: number
  children: ReactNode
}

export function Accordion({ title, defaultOpen = false, badge, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {badge !== undefined && badge > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'rgba(var(--color-accent-rgb), 0.2)',
                color: 'var(--color-accent-400)'
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 animate-slide-up">
          {children}
        </div>
      )}
    </div>
  )
}
