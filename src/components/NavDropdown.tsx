import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { lightHaptic } from '../utils/haptics'

type ViewMode = 'home' | 'results' | 'advanced'

interface NavDropdownProps {
  isOpen: boolean
  anchorRef: React.RefObject<HTMLButtonElement>
  currentView: ViewMode
  onNavigateResults: () => void
  onNavigateAdvanced: () => void
  onClose: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function NavDropdown({
  isOpen,
  anchorRef,
  currentView,
  onNavigateResults,
  onNavigateAdvanced,
  onClose,
  theme,
  onToggleTheme,
}: NavDropdownProps) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      })
    }
  }, [isOpen])

  if (!isOpen || !pos) return null

  return createPortal(
    <>
      {/* Backdrop — z-9989 nel stacking context di body */}
      <div
        className="fixed inset-0 z-[9989]"
        onClick={onClose}
        onTouchEnd={(e) => { e.preventDefault(); onClose() }}
        aria-hidden="true"
      />

      {/* Menu — z-9990 > 9989, portato a body come il backdrop */}
      <div
        className="nav-dropdown"
        style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9990 }}
        role="menu"
        aria-label="Navigazione"
      >
        {/* Filtri */}
        <button
          className={`nav-dropdown-item press-feedback${currentView === 'advanced' ? ' active' : ''}`}
          onClick={() => {
            lightHaptic()
            onNavigateAdvanced()
            onClose()
          }}
          role="menuitem"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          Filtri
        </button>

        {/* Carte */}
        <button
          className={`nav-dropdown-item press-feedback${currentView === 'results' ? ' active' : ''}`}
          onClick={() => {
            lightHaptic()
            onNavigateResults()
            onClose()
          }}
          role="menuitem"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Carte
        </button>

        {/* Toggle dark/light mode */}
        <button
          className="nav-dropdown-item press-feedback"
          onClick={() => {
            lightHaptic()
            onToggleTheme()
            onClose()
          }}
          role="menuitem"
        >
          {theme === 'dark' ? (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              Modalità Chiara
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Modalità Scura
            </>
          )}
        </button>
      </div>
    </>,
    document.body
  )
}
