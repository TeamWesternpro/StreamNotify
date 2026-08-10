import { useState } from 'react'
import { MonitorPlay, Search, X, Columns3, XCircle, Play } from 'lucide-react'
import { loadCards } from '../lib/storage'
import { PLATFORM_KEYS } from '../lib/platforms'
import PlatformTabs from '../components/PlatformTabs'
import Card from '../components/Card'

const ALL = 'all'

export default function StreamsPage({ initialFilter, onOpenCard, onContextMenu, onOpenMulti }) {
  const cards = loadCards()
  const [filter, setFilter] = useState(initialFilter || ALL)
  const [query, setQuery] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const counts = Object.fromEntries(
    PLATFORM_KEYS.map((key) => [key, cards.filter((c) => c.platform === key).length]),
  )

  const filtered = cards.filter((card) => {
    const platformOk = filter === ALL || card.platform === filter
    const q = query.trim().toLowerCase()
    const queryOk = !q || card.username.toLowerCase().includes(q) || card.description.toLowerCase().includes(q)
    return platformOk && queryOk
  })

  const toggleSelect = (card) => {
    setSelectedIds((ids) =>
      ids.includes(card.id) ? ids.filter((id) => id !== card.id) : [...ids, card.id],
    )
  }

  const clearSelection = () => {
    setSelectedIds([])
    setSelectMode(false)
  }

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
          Browse every streamer on StreamNotify. Use the platform bar to filter, search below, or
          pick multiple streams to watch at the same time.
        </p>
      </div>

      {/* Multi stream toggle */}
      <div className="animate-fade-up mb-6" style={{ animationDelay: '0.03s' }}>
        <button
          onClick={() => {
            setSelectMode((s) => !s)
            setSelectedIds([])
          }}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
            selectMode
              ? 'border-transparent bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg'
              : 'border-white/[0.1] bg-white/[0.04] text-gray-300 hover:border-purple-500/40 hover:text-white'
          }`}
        >
          <Columns3 size={16} />
          {selectMode ? 'Exit multi stream' : 'Multi Stream'}
        </button>
        {selectMode && (
          <p className="mt-2 text-xs text-gray-500">
            Click cards to select streams, then press{' '}
            <span className="font-semibold text-purple-400">Watch together</span> to play them
            side-by-side — great when a streamer is live on YouTube, Twitch and Kick at once.
          </p>
        )}
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
              <Card
                card={card}
                onOpen={onOpenCard}
                onContextMenu={onContextMenu}
                selectable={selectMode}
                selected={selectedIds.includes(card.id)}
                onToggle={toggleSelect}
              />
            </div>
          ))}
        </div>
      )}

      {/* Sticky multi stream bar */}
      {selectMode && selectedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-40 px-4">
          <div className="animate-fade-up mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#15161c]/95 p-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 pl-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white">
                <Columns3 size={16} />
              </span>
              <div>
                <p className="text-sm font-bold text-white">
                  {selectedIds.length} {selectedIds.length === 1 ? 'stream' : 'streams'} selected
                </p>
                <p className="text-[11px] text-gray-500">Watch them all at once</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:text-white"
              >
                <XCircle size={14} />
                Clear
              </button>
              <button
                onClick={() => onOpenMulti(selectedIds)}
                className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-zinc-900 transition-transform hover:scale-[1.03]"
              >
                <Play size={13} className="fill-zinc-900" />
                Watch together
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
