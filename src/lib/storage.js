const STORAGE_KEY = 'streamnotify_cards_v1'

export const MAX_CARDS = 20

export function isPlaceholderCard(card) {
  return String(card.id).startsWith('seed-')
}

export function loadCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const clean = parsed.filter((c) => !isPlaceholderCard(c))
        if (clean.length !== parsed.length) saveCards(clean)
        return clean
      }
    }
  } catch {
    // fall through
  }
  return []
}

export function saveCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  } catch {
    // localStorage may be unavailable; ignore
  }
}

export function addCard(card) {
  const cards = loadCards()
  const next = [
    {
      id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: card.username,
      description: card.description,
      platform: card.platform,
      url: card.url,
      image: card.image || '',
      mode: card.mode || 'single',
      createdAt: Date.now(),
    },
    ...cards,
  ]
  saveCards(next)
  return next
}

export function updateCard(id, card) {
  const cards = loadCards().map((c) =>
    c.id === id
      ? {
          ...c,
          username: card.username,
          description: card.description,
          platform: card.platform,
          url: card.url,
          image: card.image || c.image,
        }
      : c,
  )
  saveCards(cards)
  return cards
}

export function deleteCard(id) {
  const cards = loadCards().filter((c) => c.id !== id)
  saveCards(cards)
  return cards
}

export function deletePlaceholders() {
  const cards = loadCards().filter((c) => !isPlaceholderCard(c))
  saveCards(cards)
  return cards
}
