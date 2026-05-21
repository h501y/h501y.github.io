import type { Card, StatOperator, StatType } from '../types'

const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/

function parseNumeric(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!NUMBER_PATTERN.test(trimmed)) {
    return null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function compareNumbers(left: number, operator: StatOperator, right: number): boolean {
  if (operator === '=') return left === right
  if (operator === '>') return left > right
  if (operator === '<') return left < right
  if (operator === '>=') return left >= right
  if (operator === '<=') return left <= right
  return false
}

export function matchesStatFilter(
  card: Card,
  statType: StatType,
  statOperator: StatOperator,
  statValue: string
): boolean {
  const targetRaw = statValue.trim()
  if (!targetRaw) {
    return true
  }

  if (statType === 'cmc') {
    const cardValue = parseNumeric(card.cmc)
    const targetValue = parseNumeric(targetRaw)
    if (cardValue === null || targetValue === null) {
      return false
    }
    return compareNumbers(cardValue, statOperator, targetValue)
  }

  const sourceValue = statType === 'power' ? card.power : card.toughness
  if (sourceValue === undefined || sourceValue === null) {
    return false
  }

  const cardRaw = String(sourceValue).trim()
  const cardNumeric = parseNumeric(cardRaw)
  const targetNumeric = parseNumeric(targetRaw)

  if (statOperator === '=') {
    if (cardNumeric !== null && targetNumeric !== null) {
      return compareNumbers(cardNumeric, '=', targetNumeric)
    }
    return cardRaw === targetRaw
  }

  if (cardNumeric === null || targetNumeric === null) {
    return false
  }

  return compareNumbers(cardNumeric, statOperator, targetNumeric)
}