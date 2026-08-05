import { useState } from 'react'
import { MonitorPlay, Search, X } from 'lucide-react'
import { loadCards } from '../lib/storage'
import { PLATFORM_KEYS } from '../lib/platforms'
import PlatformTabs from '../components/PlatformTabs'
import Card from '../components/Card'

const ALL = 'all'

export default function StreamsPage({ initialFilter, onOpenCard, onContextMenu }) {
  const cards = loadCards()
  const [filter, setFilter] = useState(initialFilter || ALL)
  const [query, setQuery] = useState('')

  const counts = Object.fromEntries(
    PLATFORM_KEYS.map((key) => [key, cards.filter((c) => c.platform === key).length]),
  )

  const filtered = cards.filter((card) => {
    const platformOk = filter === ALL || card.platform === filter
    const q = query.trim().toLowerCase()
    const queryOk = !q || card.username.toLowerCase().includes(q) || card.description.toLowerCase().includes(q)
    return platformOk && queryOk
  })

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      {/* Header */}
      <div className="mb-7">
        <div className="animate-fade-up mb-2 flex items-center gap-2 text-purple-400">
          <MonitorPlay size={17} />
          <span className="text-xs font-bold uppercase tracking-widest">Live Streams</span>
        </div>
        <h1 className="animate-fade-up font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Streams
        </h1>
        <p className="animate-fade-up mt-2 max-w-lg text-sm text-gray-500">
          Browse every streamer on StreamNotify. Use the platform bar to filter, or search below.
        </p>
      </div>

      {/* Platform navbar + search */}
      <div className="animate-fade-up mb-8 space-y-4" style={{ animationDelay: '0.05s' }}>
        <PlatformTabs active={filter} onChange={setFilter} counts={counts} />

        <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/40">
          <Search size={15} className="text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search streamers..."
            className="w-full bg-transparent py-2.5 text-sm text-white placeholder-gray-600 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-500 transition-colors hover:text-white"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-400">
          Showing {filtered.length} {filtered.length === 1 ? 'stream' : 'streams'}
        </span>
        {filter !== ALL && (
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            {filter.toUpperCase()}
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-24 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-gray-500">
            <Search size={20} />
          </div>
          <p className="text-sm text-gray-500">
            {query
              ? 'No streamers match your search.'
              : filter === ALL
                ? 'No streams available right now. Check back soon!'
                : 'No streams on this platform yet. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card, i) => (
            <div key={card.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <Card card={card} onOpen={onOpenCard} onContextMenu={onContextMenu} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
