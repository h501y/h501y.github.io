export interface ParsedQuery {
  name?: string
  colors?: string[]
  type?: string
  rarity?: string[]
  set?: string
  cmc?: { operator: string, value: number }
  power?: { operator: string, value: number }
  toughness?: { operator: string, value: number }
  text?: string
  tag?: string
  identity?: string[]
}

const fieldAliases: Record<string, string> = {
  n: 'name',
  c: 'color',
  t: 'type',
  r: 'rarity',
  s: 'set',
  mana: 'cmc',
  pow: 'power',
  tou: 'toughness',
  o: 'text',
  id: 'identity'
}

const colorAliases: Record<string, string> = {
  w: 'W',
  u: 'U',
  b: 'B',
  r: 'R',
  g: 'G',
  c: 'C',
  white: 'W',
  blue: 'U',
  black: 'B',
  red: 'R',
  green: 'G',
  colorless: 'C'
}

const rarityAliases: Record<string, string> = {
  m: 'mythic',
  r: 'rare',
  u: 'uncommon',
  c: 'common',
  mythic: 'mythic',
  rare: 'rare',
  uncommon: 'uncommon',
  common: 'common'
}

function tokenize(query: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quoteChar: '"' | "'" | null = null

  for (let i = 0; i < query.length; i++) {
    const char = query[i]

    if (char === '"' || char === "'") {
      if (quoteChar === null) {
        const prevChar = i > 0 ? query[i - 1] : ' '
        const canStartQuote = current.length === 0 || /\s|:/.test(prevChar)
        if (canStartQuote) {
          quoteChar = char
          current += char
          continue
        }
      } else if (char === quoteChar) {
        quoteChar = null
        current += char
        continue
      }
    }

    if (char === ' ' && quoteChar === null) {
      if (current.trim()) {
        tokens.push(current.trim())
        current = ''
      }
    } else {
      current += char
    }
  }

  if (current.trim()) {
    tokens.push(current.trim())
  }

  return tokens
}

function parseToken(token: string): { field: string, operator: string, value: string } | null {
  const match = token.match(/^([a-zA-Z_]+)(:|>=|<=|>|<)(.+)$/)
  if (!match) {
    return null
  }

  let [, field, operator, value] = match
  field = field.toLowerCase()
  field = fieldAliases[field] || field
  value = value.replace(/^["']|["']$/g, '')

  return { field, operator, value }
}

function splitMultiValue(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean)
    .flatMap((chunk) => (/^[wubrgc]+$/.test(chunk) ? chunk.split('') : [chunk]))
}

export function parseQuery(query: string): ParsedQuery {
  const result: ParsedQuery = {}

  if (!query || !query.trim()) {
    return result
  }

  const tokens = tokenize(query)
  const unmatchedTokens: string[] = []

  for (const token of tokens) {
    if (['AND', 'OR', 'NOT', '&', '|', '-'].includes(token.toUpperCase())) {
      continue
    }

    const parsed = parseToken(token)
    if (!parsed) {
      unmatchedTokens.push(token)
      continue
    }

    const { field, operator, value } = parsed

    switch (field) {
      case 'name':
        result.name = value
        break

      case 'color': {
        const colors = splitMultiValue(value)
        result.colors = colors
          .map((c) => colorAliases[c] || c.toUpperCase())
          .filter(Boolean)
        break
      }

      case 'type':
        result.type = value
        break

      case 'rarity': {
        const rarities = value.toLowerCase().split(/[,\s]+/).filter(Boolean)
        result.rarity = rarities
          .map((r) => rarityAliases[r] || r)
          .filter(Boolean)
        break
      }

      case 'set':
        result.set = value.toUpperCase()
        break

      case 'text':
        result.text = value
        break

      case 'tag':
        result.tag = value
        break

      case 'identity': {
        const identityColors = splitMultiValue(value)
        result.identity = identityColors
          .map((c) => colorAliases[c] || c.toUpperCase())
          .filter(Boolean)
        break
      }

      case 'cmc': {
        const cmcNum = parseFloat(value)
        if (!Number.isNaN(cmcNum)) {
          result.cmc = {
            operator: operator === ':' ? '=' : operator,
            value: cmcNum
          }
        }
        break
      }

      case 'power': {
        const powerNum = parseFloat(value)
        if (!Number.isNaN(powerNum)) {
          result.power = {
            operator: operator === ':' ? '=' : operator,
            value: powerNum
          }
        }
        break
      }

      case 'toughness': {
        const toughnessNum = parseFloat(value)
        if (!Number.isNaN(toughnessNum)) {
          result.toughness = {
            operator: operator === ':' ? '=' : operator,
            value: toughnessNum
          }
        }
        break
      }
    }
  }

  if (unmatchedTokens.length > 0 && !result.name) {
    result.name = unmatchedTokens.join(' ').replace(/^["']|["']$/g, '')
  }

  return result
}