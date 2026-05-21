import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { StatType, StatOperator } from '../../types'
import { CustomSelect } from '../ui/CustomSelect'

interface StatsFilterProps {
  manaCostFilter: string
  manaCostExact: boolean
  statType: StatType
  statOperator: StatOperator
  statValue: string
  onManaCostFilterChange: (value: string) => void
  onManaCostExactChange: (value: boolean) => void
  onStatTypeChange: (type: StatType) => void
  onStatOperatorChange: (operator: StatOperator) => void
  onStatValueChange: (value: string) => void
}

const PICKER_SYM = 28
const PREVIEW_SYM = 24

function symToUrl(sym: string): string {
  return `https://svgs.scryfall.io/card-symbols/${sym.replace(/\//g, '')}.svg`
}

const SYMBOL_GROUPS = [
  { label: 'Generico',        syms: ['X', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '15'] },
  { label: 'Colore',          syms: ['W', 'U', 'B', 'R', 'G', 'C', 'S'] },
  { label: 'Phyrexian',       syms: ['W/P', 'U/P', 'B/P', 'R/P', 'G/P'] },
  { label: 'Ibrido',          syms: ['W/U', 'U/B', 'B/R', 'R/G', 'G/W', 'W/B', 'U/R', 'B/G', 'R/W', 'G/U'] },
  { label: 'Ibrido generico', syms: ['2/W', '2/U', '2/B', '2/R', '2/G'] },
]

interface ManaModalProps {
  onConfirm: (syms: string[]) => void
  onClose: () => void
}

function ManaModal({ onConfirm, onClose }: ManaModalProps) {
  const [pending, setPending] = useState<string[]>([])

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const addSym = (sym: string) => setPending((p) => [...p, sym])
  const removeLast = () => setPending((p) => p.slice(0, -1))

  const handleConfirm = () => {
    if (pending.length > 0) onConfirm(pending)
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      {/* Sheet panel */}
      <div
        className="animate-slide-up flex flex-col"
        style={{
          background: 'var(--surface-dropdown)',
          borderTop: '1px solid var(--surface-border)',
          boxShadow: 'var(--shadow-lifted)',
          maxHeight: '80vh',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--overlay-white-20)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-gray-100)' }}>
            Simboli mana
          </span>
          <button
            type="button"
            onClick={onClose}
            className="press-feedback"
            style={{ color: 'var(--color-gray-400)', lineHeight: 0 }}
            aria-label="Chiudi"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Preview bar ── */}
        <div
          className="mx-4 mb-3 px-3 py-2 rounded-xl flex items-center gap-2 shrink-0"
          style={{
            border: '1px solid var(--surface-border)',
            background: 'var(--overlay-white-5)',
            minHeight: '3rem',
          }}
        >
          <div className="flex-1 flex flex-wrap gap-0.5 min-h-[1.5rem]">
            {pending.length === 0 ? (
              <span className="text-sm self-center" style={{ color: 'var(--color-gray-500)' }}>
                Seleziona simboli…
              </span>
            ) : (
              pending.map((sym, i) => (
                <img
                  key={i}
                  src={symToUrl(sym)}
                  alt={`{${sym}}`}
                  width={PREVIEW_SYM}
                  height={PREVIEW_SYM}
                  draggable={false}
                />
              ))
            )}
          </div>
          {pending.length > 0 && (
            <button
              type="button"
              onClick={removeLast}
              className="press-feedback shrink-0 px-2 py-1 rounded-lg text-micro"
              style={{ border: '1px solid var(--overlay-white-20)', color: 'var(--color-gray-400)' }}
              aria-label="Rimuovi ultimo simbolo"
            >
              ⌫
            </button>
          )}
        </div>

        {/* ── Symbol groups — scrollable ── */}
        <div className="overflow-y-auto custom-scrollbar px-4 space-y-3 pb-3">
          {SYMBOL_GROUPS.map(({ label, syms }) => (
            <div key={label}>
              <p className="text-micro mb-1.5" style={{ color: 'var(--color-gray-500)' }}>{label}</p>
              <div className="flex flex-wrap gap-1.5">
                {syms.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => addSym(sym)}
                    style={{ lineHeight: 0, padding: 0, background: 'none', border: 'none' }}
                    aria-label={`{${sym}}`}
                  >
                    <img
                      src={symToUrl(sym)}
                      alt={`{${sym}}`}
                      width={PICKER_SYM}
                      height={PICKER_SYM}
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Confirm button ── */}
        <div
          className="px-4 pt-3 pb-4 shrink-0"
          style={{ borderTop: '1px solid var(--surface-border)' }}
        >
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending.length === 0}
            className="btn-primary w-full py-3 text-sm font-semibold press-feedback"
            style={{ opacity: pending.length === 0 ? 0.4 : 1 }}
          >
            Inserisci {pending.length > 0 ? `(${pending.length})` : ''}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function StatsFilter({
  manaCostFilter, manaCostExact, statType, statOperator, statValue,
  onManaCostFilterChange, onManaCostExactChange, onStatTypeChange, onStatOperatorChange, onStatValueChange
}: StatsFilterProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const insertSymbols = (syms: string[]) => {
    const input = inputRef.current
    const text = syms.map((s) => `{${s}}`).join('')
    if (!input) {
      onManaCostFilterChange(manaCostFilter + text)
      return
    }
    const start = input.selectionStart ?? manaCostFilter.length
    const end = input.selectionEnd ?? manaCostFilter.length
    const newVal = manaCostFilter.slice(0, start) + text + manaCostFilter.slice(end)
    onManaCostFilterChange(newVal)
    const newPos = start + text.length
    requestAnimationFrame(() => {
      input.setSelectionRange(newPos, newPos)
      input.focus()
    })
  }

  return (
    <div className="space-y-3">

      {/* ── Mana cost ── */}
      <div>
        <label htmlFor="mana-cost-input" className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-gray-100)' }}>
          Costo di Mana
        </label>

        <div className="flex gap-1.5">
          <input
            ref={inputRef}
            id="mana-cost-input"
            type="text"
            value={manaCostFilter}
            onChange={(e) => onManaCostFilterChange(e.target.value)}
            placeholder="es. {2}{U}{U}"
            className="flex-1 px-3 py-2 rounded-lg glass text-sm focus:outline-none"
            style={{
              border: '1px solid var(--overlay-white-20)',
              color: 'var(--color-gray-200)',
              fontSize: '14px',
              minHeight: '2.5rem',
            }}
          />
          {/* Toggle esatto / contiene */}
          <button
            type="button"
            onClick={() => onManaCostExactChange(!manaCostExact)}
            className="px-2.5 rounded-lg glass press-feedback flex items-center justify-center text-micro font-semibold"
            style={{
              border: `1px solid ${manaCostExact ? 'var(--color-primary-500)' : 'var(--overlay-white-20)'}`,
              minHeight: '2.5rem',
              minWidth: '2.5rem',
              color: manaCostExact ? 'var(--color-primary-200)' : 'var(--color-gray-400)',
              backgroundColor: manaCostExact ? 'rgba(var(--color-primary-rgb), 0.18)' : undefined,
            }}
            aria-pressed={manaCostExact}
            aria-label={manaCostExact ? 'Modalità: corrispondenza esatta' : 'Modalità: contiene'}
          >
            {manaCostExact ? '=' : '~'}
          </button>

          {/* Apri selettore simboli */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-3 rounded-lg glass press-feedback flex items-center justify-center"
            style={{ border: '1px solid var(--overlay-white-20)', minHeight: '2.5rem', minWidth: '2.5rem' }}
            aria-label="Apri selettore simboli mana"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ color: 'var(--color-gray-400)' }} aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {modalOpen && (
        <ManaModal
          onConfirm={insertSymbols}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ── Stat filters ── */}
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-gray-100)' }}>
          Statistiche
        </label>
        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
          {(['cmc', 'power', 'toughness'] as StatType[]).map((type) => (
            <button
              key={type}
              onClick={() => onStatTypeChange(type)}
              className="px-2 py-1 rounded-lg text-micro font-medium transition-all duration-200 min-h-0 h-10 press-feedback"
              style={{
                backgroundColor: statType === type ? 'rgba(var(--color-primary-rgb), 0.3)' : 'var(--overlay-white-5)',
                border: `1px solid ${statType === type ? 'var(--color-primary-500)' : 'var(--overlay-white-10)'}`,
                color: statType === type ? 'var(--color-primary-200)' : 'var(--color-gray-400)'
              }}
            >
              {type === 'cmc' ? 'CMC' : type === 'power' ? 'POW' : 'TOU'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <CustomSelect
            value={statOperator}
            onChange={(v) => onStatOperatorChange(v as StatOperator)}
            options={[
              { value: '=', label: '=' },
              { value: '>', label: '>' },
              { value: '<', label: '<' },
              { value: '>=', label: '>=' },
              { value: '<=', label: '<=' },
            ]}
            className="w-24 shrink-0"
            aria-label="Operatore statistiche"
          />
          <input
            type="text"
            inputMode="numeric"
            value={statValue}
            onChange={(e) => onStatValueChange(e.target.value)}
            placeholder="Valore"
            aria-label="Valore statistica"
            className="flex-1 px-3 py-2 rounded-lg glass text-sm focus:outline-none"
            style={{
              border: '1px solid var(--overlay-white-20)',
              color: 'var(--color-gray-200)',
              fontSize: '14px',
              minHeight: '2.5rem',
            }}
          />
        </div>
      </div>

    </div>
  )
}
