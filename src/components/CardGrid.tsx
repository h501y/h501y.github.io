import { memo, useEffect, useState } from 'react'
import type { Card } from '../types'
import { lightHaptic } from '../utils/haptics'

const PAGE_SIZE = 100

interface CardGridProps {
  cards: Card[]
}

// Rarity colours â€” matches both abbreviated (C/U/R/M from mobile share payload)
// and full-word (common/uncommon/rare/mythic from normaliseCollectionData).
const RARITY_COLOR: Record<string, string> = {
  M: '#f97316', mythic: '#f97316',
  R: '#eab308', rare: '#eab308',
  U: '#94a3b8', uncommon: '#94a3b8',
  C: '#6b7280', common: '#6b7280',
}

function rarityColor(rarity: string): string {
  return RARITY_COLOR[rarity] ?? '#6b7280'
}

function editionChip(card: Card): string {
  if (card.edition_code) return card.edition_code.toUpperCase()
  return card.edition.slice(0, 4).toUpperCase()
}

const CardRow = memo(function CardRow({ card }: { card: Card }) {
  return (
    <li
      className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0"
      style={{ borderColor: 'var(--overlay-white-10, rgba(255,255,255,0.08))' }}
    >
      {/* Rarity dot */}
      <span
        className="shrink-0 w-2 h-2 rounded-full"
        style={{ backgroundColor: rarityColor(card.rarity) }}
        aria-label={`RaritÃ : ${card.rarity}`}
      />

      {/* Name */}
      <span
        className="flex-1 min-w-0 truncate text-sm font-medium"
        style={{ color: 'var(--color-gray-100, #f1f5f9)' }}
        title={card.name}
      >
        {card.name}
      </span>

      {/* Edition chip */}
      <span
        className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded"
        style={{
          background: 'var(--overlay-white-10, rgba(255,255,255,0.08))',
          color: 'var(--color-gray-400, #94a3b8)',
        }}
      >
        {editionChip(card)}
      </span>

      {/* Quantity */}
      <span
        className="shrink-0 text-sm font-bold tabular-nums"
        style={{
          color: 'var(--color-accent-400, #818cf8)',
          minWidth: '2rem',
          textAlign: 'right',
        }}
      >
        Ã—{card.quantity}
      </span>

      {/* Mana cost */}
      {card.mana_cost && (
        <span
          className="shrink-0 text-xs font-mono"
          style={{
            color: 'var(--color-gray-400, #94a3b8)',
            maxWidth: '7rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={card.mana_cost}
        >
          {card.mana_cost}
        </span>
      )}
    </li>
  )
})

export function CardGrid({ cards }: CardGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [cards])

  if (cards.length === 0) {
    return (
      <div className="py-10 sm:py-14">
        <div className="state-panel max-w-xl mx-auto p-6 sm:p-8 text-center space-y-3 animate-fade-in">
          <div
            className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: 'var(--color-warning-500)'
            }}
            aria-hidden="true"
          >
            0
          </div>
          <h3 className="text-xl font-semibold">Nessun risultato</h3>
          <p className="text-sm" style={{ color: 'var(--color-gray-300)' }}>
            Nessuna carta corrisponde ai filtri correnti.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-gray-500)' }}>
            Prova ad allargare i filtri su tipo, colori o raritÃ .
          </p>
        </div>
      </div>
    )
  }

  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageCards = cards.slice(pageStart, pageStart + PAGE_SIZE)

  const goToPrev = () => {
    lightHaptic()
    setCurrentPage((p) => Math.max(1, p - 1))
  }

  const goToNext = () => {
    lightHaptic()
    setCurrentPage((p) => Math.min(totalPages, p + 1))
  }

  const Pagination = () => (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        onClick={goToPrev}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/10 touch-target press-feedback disabled:opacity-30 disabled:pointer-events-none"
        style={{ border: '1px solid var(--overlay-white-20)', color: 'var(--color-accent-400)' }}
        aria-label="Pagina precedente"
      >
        â€¹ Prec
      </button>
      <span className="text-xs" style={{ color: 'var(--color-gray-400)' }} aria-live="polite">
        {currentPage} / {totalPages}
        <span className="ml-2" style={{ color: 'var(--color-gray-500)' }}>
          ({cards.length} carte)
        </span>
      </span>
      <button
        onClick={goToNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/10 touch-target press-feedback disabled:opacity-30 disabled:pointer-events-none"
        style={{ border: '1px solid var(--overlay-white-20)', color: 'var(--color-accent-400)' }}
        aria-label="Pagina successiva"
      >
        Succ â€º
      </button>
    </div>
  )

  return (
    <>
      {totalPages > 1 && <Pagination />}

      <ul
        className="glass card-surface rounded-xl overflow-hidden"
        aria-label={`${cards.length} carte`}
      >
        {pageCards.map((card) => (
          <CardRow
            key={card.id ?? `${card.name}-${card.edition}-${card.collector_number ?? ''}`}
            card={card}
          />
        ))}
      </ul>

      {totalPages > 1 && <Pagination />}
    </>
  )
}

