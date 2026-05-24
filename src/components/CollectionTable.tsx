import { useEffect, useMemo, useRef, useState } from 'react'
import type { Card } from '../types'
import { rarityColor, scryfallUrlFor, type SortDirection, type SortField } from '../utils/searchCards'

interface CollectionTableProps {
  cards: Card[]
  sortField: SortField
  sortDirection: SortDirection
  onChangeSort: (field: SortField) => void
}

const ROW_HEIGHT = 56
const OVERSCAN = 6

const SORT_LABELS: Record<SortField, string> = {
  name: 'Nome',
  quantity: 'Quantità',
  rarity: 'Rarità'
}

function SortHeader({
  field,
  label,
  currentField,
  currentDirection,
  onClick,
  align = 'left'
}: {
  field: SortField
  label: string
  currentField: SortField
  currentDirection: SortDirection
  onClick: (field: SortField) => void
  align?: 'left' | 'right' | 'center'
}) {
  const active = currentField === field
  const arrow = active ? (currentDirection === 'asc' ? '↑' : '↓') : ''
  return (
    <button
      type="button"
      onClick={() => onClick(field)}
      className="table-sort-header"
      data-align={align}
      data-active={active || undefined}
      aria-label={`Ordina per ${label}${active ? ` (${currentDirection === 'asc' ? 'crescente' : 'decrescente'})` : ''}`}
    >
      <span>{label}</span>
      <span className="table-sort-arrow" aria-hidden="true">{arrow}</span>
    </button>
  )
}

export function CollectionTable({
  cards,
  sortField,
  sortDirection,
  onChangeSort
}: CollectionTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(600)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const measure = () => setViewportHeight(el.clientHeight)
    measure()

    const onScroll = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll, { passive: true })

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', onScroll)
      resizeObserver.disconnect()
    }
  }, [])

  // Reset scroll to top whenever the displayed list identity changes
  // (new search, new sort) so the user is not stranded on a row index
  // that no longer corresponds to anything meaningful.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = 0
    setScrollTop(0)
  }, [cards, sortField, sortDirection])

  const totalHeight = cards.length * ROW_HEIGHT
  const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(cards.length, startIndex + visibleCount)

  const visibleRows = useMemo(() => {
    const rows: Array<{ card: Card; index: number }> = []
    for (let i = startIndex; i < endIndex; i++) {
      rows.push({ card: cards[i], index: i })
    }
    return rows
  }, [cards, startIndex, endIndex])

  if (cards.length === 0) {
    return (
      <div className="table-empty">
        Nessuna carta corrisponde alla ricerca.
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <div className="table-head" role="row">
        <SortHeader
          field="name"
          label={SORT_LABELS.name}
          currentField={sortField}
          currentDirection={sortDirection}
          onClick={onChangeSort}
        />
        <SortHeader
          field="rarity"
          label={SORT_LABELS.rarity}
          currentField={sortField}
          currentDirection={sortDirection}
          onClick={onChangeSort}
          align="center"
        />
        <SortHeader
          field="quantity"
          label={SORT_LABELS.quantity}
          currentField={sortField}
          currentDirection={sortDirection}
          onClick={onChangeSort}
          align="right"
        />
      </div>

      <div ref={scrollRef} className="table-scroll" role="rowgroup">
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleRows.map(({ card, index }) => {
            const showItalian =
              card.italian_name &&
              card.italian_name.trim().length > 0 &&
              card.italian_name.trim().toLowerCase() !== card.name.trim().toLowerCase()
            return (
              <a
                key={`${card.id ?? card.scryfall_id ?? card.name}-${index}`}
                href={scryfallUrlFor(card)}
                target="_blank"
                rel="noopener noreferrer"
                className="table-row"
                style={{
                  position: 'absolute',
                  top: index * ROW_HEIGHT,
                  height: ROW_HEIGHT
                }}
                role="row"
              >
                <div className="table-cell-name">
                  <span className="table-card-name">{card.name}</span>
                  {showItalian && (
                    <span className="table-card-italian">{card.italian_name}</span>
                  )}
                </div>
                <div className="table-cell-rarity" aria-label={`Rarità ${card.rarity || 'sconosciuta'}`}>
                  <span
                    className="table-rarity-dot"
                    style={{ background: rarityColor(card.rarity) }}
                  />
                </div>
                <div className="table-cell-qty">{card.quantity}</div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
