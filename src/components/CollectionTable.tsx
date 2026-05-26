import type { ReactNode } from 'react'
import type { Card } from '../types'
import { rarityColor, scryfallUrlFor, type SortDirection, type SortField } from '../utils/searchCards'

interface CollectionTableProps {
  cards: Card[]
  sortField: SortField
  sortDirection: SortDirection
  onChangeSort: (field: SortField) => void
}

interface HeaderCellProps {
  field: SortField
  /** What renders inside the column header (text or a glyph). */
  label: ReactNode
  /** Plain text used for the accessible aria-label; falls back to `label`. */
  labelText: string
  currentField: SortField
  currentDirection: SortDirection
  onClick: (field: SortField) => void
  align?: 'left' | 'right' | 'center'
}

function HeaderCell({
  field,
  label,
  labelText,
  currentField,
  currentDirection,
  onClick,
  align = 'left'
}: HeaderCellProps) {
  const active = currentField === field
  const arrow = active ? (currentDirection === 'asc' ? '↑' : '↓') : ''
  return (
    <th scope="col" data-align={align} data-active={active || undefined}>
      <button
        type="button"
        onClick={() => onClick(field)}
        aria-label={`Ordina per ${labelText}${active ? ` (${currentDirection === 'asc' ? 'crescente' : 'decrescente'})` : ''}`}
      >
        <span className="th-label">{label}</span>
        <span className="th-arrow" aria-hidden="true">{arrow}</span>
      </button>
    </th>
  )
}

export function CollectionTable({
  cards,
  sortField,
  sortDirection,
  onChangeSort
}: CollectionTableProps) {
  if (cards.length === 0) {
    return (
      <div className="table-empty">
        Nessuna carta corrisponde alla ricerca.
      </div>
    )
  }

  return (
    <div className="table-scroll" role="region" aria-label="Collezione">
      <table className="collection-table">
        <colgroup>
          <col className="col-name" />
          <col className="col-rarity" />
          <col className="col-qty" />
        </colgroup>
        <thead>
          <tr>
            <HeaderCell
              field="name"
              label="Nome"
              labelText="Nome"
              currentField={sortField}
              currentDirection={sortDirection}
              onClick={onChangeSort}
            />
            <HeaderCell
              field="rarity"
              label={<span className="th-rarity-glyph" aria-hidden="true">●</span>}
              labelText="Rarità"
              currentField={sortField}
              currentDirection={sortDirection}
              onClick={onChangeSort}
              align="center"
            />
            <HeaderCell
              field="quantity"
              label="Qtà"
              labelText="Quantità"
              currentField={sortField}
              currentDirection={sortDirection}
              onClick={onChangeSort}
              align="center"
            />
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => {
            const showItalian =
              !!card.italian_name &&
              card.italian_name.trim().length > 0 &&
              card.italian_name.trim().toLowerCase() !== card.name.trim().toLowerCase()
            // Stable key derived from card identity (no row index): the
            // browser keeps the <a> mounted across re-sorts and the tap
            // never lands on a remounted element.
            const key =
              card.scryfall_id ??
              (card.id !== undefined ? `id:${card.id}` : `${card.name}|${card.edition_code ?? ''}|${card.collector_number ?? ''}`)
            return (
              <tr key={key}>
                <td className="cell-name">
                  <a
                    href={scryfallUrlFor(card)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cell-name-link"
                  >
                    <span className="cell-name-primary">{card.name}</span>
                    {showItalian && (
                      <span className="cell-name-secondary">{card.italian_name}</span>
                    )}
                  </a>
                </td>
                <td className="cell-rarity">
                  <span
                    className="rarity-dot"
                    style={{ background: rarityColor(card.rarity) }}
                    aria-label={`Rarità ${card.rarity || 'sconosciuta'}`}
                  />
                </td>
                <td className="cell-qty">{card.quantity}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
