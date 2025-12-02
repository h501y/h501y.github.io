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

// Field mappings: abbreviations to full names
const fieldAliases: Record<string, string> = {
  'n': 'name',
  'c': 'color',
  't': 'type',
  'r': 'rarity',
  's': 'set',
  'mana': 'cmc',
  'pow': 'power',
  'tou': 'toughness',
  'o': 'text',
  'id': 'identity'
}

// Color abbreviations mapping
const colorAliases: Record<string, string> = {
  'w': 'W',
  'u': 'U',
  'b': 'B',
  'r': 'R',
  'g': 'G',
  'c': 'C',
  'white': 'W',
  'blue': 'U',
  'black': 'B',
  'red': 'R',
  'green': 'G',
  'colorless': 'C'
}

// Rarity abbreviations mapping
const rarityAliases: Record<string, string> = {
  'm': 'mythic',
  'r': 'rare',
  'u': 'uncommon',
  'c': 'common',
  'mythic': 'mythic',
  'rare': 'rare',
  'uncommon': 'uncommon',
  'common': 'common'
}

/**
 * Tokenize query string respecting quoted strings
 */
function tokenize(query: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < query.length; i++) {
    const char = query[i]

    if (char === '"' || char === "'") {
      inQuotes = !inQuotes
      current += char
    } else if (char === ' ' && !inQuotes) {
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

/**
 * Parse a single token and extract field, operator, and value
 */
function parseToken(token: string): { field: string, operator: string, value: string } | null {
  // Match patterns like: field:value, field>value, field>=value, field<value, field<=value
  const match = token.match(/^([a-zA-Z_]+)(:|>=|<=|>|<)(.+)$/)

  if (!match) {
    return null
  }

  let [, field, operator, value] = match

  // Normalize field name (handle aliases)
  field = field.toLowerCase()
  field = fieldAliases[field] || field

  // Remove quotes from value if present
  value = value.replace(/^["']|["']$/g, '')

  return { field, operator, value }
}

/**
 * Parse query string into structured filters
 */
export function parseQuery(query: string): ParsedQuery {
  const result: ParsedQuery = {}

  if (!query || !query.trim()) {
    return result
  }

  const tokens = tokenize(query)
  const unmatchedTokens: string[] = []

  for (const token of tokens) {
    // Skip boolean operators for now (could be enhanced later)
    if (['AND', 'OR', 'NOT', '&', '|', '-'].includes(token.toUpperCase())) {
      continue
    }

    const parsed = parseToken(token)
    if (!parsed) {
      // Collect tokens that don't match field:value pattern
      unmatchedTokens.push(token)
      continue
    }

    const { field, operator, value } = parsed

    switch (field) {
      case 'name':
        result.name = value
        break

      case 'color':
        // Handle multiple colors (e.g., "c:rg" or "color:red,green")
        const colors = value.toLowerCase().split(/[,\s]/).filter(Boolean)
        result.colors = colors.map(c => colorAliases[c] || c.toUpperCase()).filter(Boolean)
        break

      case 'type':
        result.type = value
        break

      case 'rarity':
        // Handle multiple rarities (e.g., "r:m,r" or "rarity:mythic,rare")
        const rarities = value.toLowerCase().split(/[,\s]/).filter(Boolean)
        result.rarity = rarities.map(r => rarityAliases[r] || r).filter(Boolean)
        break

      case 'set':
        result.set = value.toUpperCase()
        break

      case 'text':
        result.text = value
        break

      case 'tag':
        result.tag = value
        break

      case 'identity':
        // Handle color identity (e.g., "id:uw" or "identity:blue,white")
        const identityColors = value.toLowerCase().split(/[,\s]/).filter(Boolean)
        result.identity = identityColors.map(c => colorAliases[c] || c.toUpperCase()).filter(Boolean)
        break

      case 'cmc':
        const cmcNum = parseFloat(value)
        if (!isNaN(cmcNum)) {
          result.cmc = {
            operator: operator === ':' ? '=' : operator,
            value: cmcNum
          }
        }
        break

      case 'power':
        const powerNum = parseFloat(value)
        if (!isNaN(powerNum)) {
          result.power = {
            operator: operator === ':' ? '=' : operator,
            value: powerNum
          }
        }
        break

      case 'toughness':
        const toughnessNum = parseFloat(value)
        if (!isNaN(toughnessNum)) {
          result.toughness = {
            operator: operator === ':' ? '=' : operator,
            value: toughnessNum
          }
        }
        break
    }
  }

  // If there are unmatched tokens and no explicit name filter, use them as name search
  if (unmatchedTokens.length > 0 && !result.name) {
    result.name = unmatchedTokens.join(' ').replace(/^["']|["']$/g, '')
  }

  return result
}

/**
 * Example usage:
 * parseQuery("c:r t:creature cmc>=3")
 * // => { colors: ['R'], type: 'creature', cmc: { operator: '>=', value: 3 } }
 *
 * parseQuery("color:red type:creature mana>=3")
 * // => { colors: ['R'], type: 'creature', cmc: { operator: '>=', value: 3 } }
 *
 * parseQuery("name:swamp set:M21 r:c")
 * // => { name: 'swamp', set: 'M21', rarity: ['common'] }
 *
 * parseQuery("Lightning Bolt")
 * // => { name: 'Lightning Bolt' }
 *
 * parseQuery("Jace c:u")
 * // => { name: 'Jace', colors: ['U'] }
 */
