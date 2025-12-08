import type { Card } from '../types'

interface CardGridProps {
  cards: Card[]
}

const getRarityStyle = (rarity: string) => {
  const r = rarity.toLowerCase()

  if (r === 'm' || r === 'mythic') {
    return {
      background: 'radial-gradient(circle at 30% 30%, #d47040, #c06030, #a04020)',
      border: '1px solid #000'
    }
  } else if (r === 'r' || r === 'rare') {
    return {
      background: 'radial-gradient(circle at 30% 30%, #c89830, #b08820, #907010)',
      border: '1px solid #000'
    }
  } else if (r === 'u' || r === 'uncommon') {
    return {
      background: 'radial-gradient(circle at 30% 30%, #c5d4e0, #a8b9c5, #8a9aa5)',
      border: '1px solid #000'
    }
  } else {
    return {
      background: 'radial-gradient(circle at 30% 30%, #2d3434, #1d2424, #0d1414)',
      border: '1px solid #fff'
    }
  }
}

export function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-lg" style={{ color: 'var(--color-gray-400)' }}>
          Nessuna carta trovata
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--color-gray-500)' }}>
          Prova a modificare i filtri
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        // Parse tags if they exist
        let parsedTags: Array<{ name: string; colorIndex: number }> = []
        if (card.tags) {
          try {
            parsedTags = typeof card.tags === 'string' ? JSON.parse(card.tags) : card.tags
          } catch (e) {
            // If parsing fails, ignore tags
          }
        }

        return (
          <div
            key={card.id}
            className="glass p-3 rounded-lg transition-all duration-200 animate-fade-in"
          >
            {/* Card image */}
            {card.image_uris && (
              <div className="w-full aspect-[5/7] mb-2 overflow-hidden shadow-md relative" style={{ borderRadius: '4.75% / 3.5%' }}>
                <img
                  src={card.image_uris}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Tag badge */}
                {parsedTags.length > 0 && (
                  <div 
                    className="absolute bottom-1 left-1 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-lg"
                    style={{ backgroundColor: 'var(--color-secondary-600)' }}
                  >
                    {parsedTags[0].name}
                  </div>
                )}
              </div>
            )}

            {/* Card info */}
            <div className="text-sm font-semibold mb-1 truncate" title={card.name}>
              {card.name}
            </div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-gray-400)' }} title={card.edition}>
              {card.edition}
            </div>

            {/* Scryfall Link & Quantity */}
            <div className="flex items-center justify-between mt-2">
              {card.scryfall_id ? (
                <a
                  href={`https://scryfall.com/card/${card.scryfall_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline flex items-center gap-1"
                  style={{ color: 'var(--color-accent-400)' }}
                >
                  🔗 Scryfall
                </a>
              ) : (
                <div className="w-4" />
              )}
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full shadow-md"
                  style={getRarityStyle(card.rarity)}
                  title={card.rarity}
                />
                <span className="text-xs font-medium" style={{ color: 'var(--color-accent-400)' }}>
                  Qty: {card.quantity}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
