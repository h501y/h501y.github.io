import type { Card } from '../types'

interface CardGridProps {
  cards: Card[]
  onCardClick: (card: Card) => void
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

export function CardGrid({ cards, onCardClick }: CardGridProps) {
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
        const imageUri = card.image_uris ? JSON.parse(card.image_uris) : null

        return (
          <div
            key={card.id}
            className="glass p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200 animate-fade-in hover:scale-105"
            onClick={() => onCardClick(card)}
          >
            {/* Card image */}
            {imageUri?.normal && (
              <div className="w-full aspect-[5/7] mb-2 rounded overflow-hidden shadow-md">
                <img
                  src={imageUri.normal}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Card info */}
            <div className="text-sm font-semibold mb-1 truncate" title={card.name}>
              {card.name}
            </div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-gray-400)' }} title={card.edition}>
              {card.edition}
            </div>

            {/* Rarity & Quantity */}
            <div className="flex items-center justify-between mt-2">
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
        )
      })}
    </div>
  )
}
