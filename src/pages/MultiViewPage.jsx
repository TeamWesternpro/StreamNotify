import { useState } from 'react'
import { ArrowLeft, ExternalLink, X, Columns3, MonitorPlay } from 'lucide-react'
import { loadCards } from '../lib/storage'
import { PLATFORMS } from '../lib/platforms'
import { buildEmbedUrl } from '../lib/embeds'
import PlatformIcon from '../components/PlatformIcon'

export default function MultiViewPage({ ids, onNavigate }) {
  const allCards = loadCards()
  const [activeIds, setActiveIds] = useState(() => ids || [])

  const streams = allCards.filter((c) => activeIds.includes(c.id))
  const count = streams.length

  const removeStream = (id) => setActiveIds((ids) => ids.filter((i) => i !== id))

  const gridClass =
    count === 1
      ? 'mx-auto max-w-4xl'
      : count === 2
        ? 'grid grid-cols-1 gap-4 xl:grid-cols-2'
        : 'grid grid-cols-1 gap-4 xl:grid-cols-2'

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-purple-400">
            <Columns3 size={17} />
            <span className="text-xs font-bold uppercase tracking-widest">Multi Stream</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Watch together
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500">
            Playing {count} {count === 1 ? 'stream' : 'streams'} side-by-side. Perfect when a
            streamer is live on YouTube, Twitch and Kick at the same time.
          </p>
        </div>
        <button
          onClick={() => onNavigate('streams')}
          className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:border-white/25 hover:text-white"
        >
          <ArrowLeft size={15} />
          Back to streams
        </button>
      </div>

      {streams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-24 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-gray-500">
            <MonitorPlay size={20} />
          </div>
          <p className="text-sm text-gray-500">
            No streams selected. Head back to the Streams page and pick some cards.
          </p>
          <button
            onClick={() => onNavigate('streams')}
            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.03]"
          >
            Pick streams
          </button>
        </div>
      ) : (
        <div className={gridClass}>
          {streams.map((card, i) => {
            const platform = PLATFORMS[card.platform] || PLATFORMS.youtube
            const embedUrl = buildEmbedUrl(card.platform, card.url)
            const spansFull = count % 2 === 1 && i === streams.length - 1
            return (
              <div
                key={card.id}
                className={`animate-fade-up overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121216] ${
                  spansFull ? 'xl:col-span-2' : ''
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Tile header */}
                <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${platform.color}22`, color: platform.color }}
                  >
                    <PlatformIcon platform={card.platform} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white">{card.username}</h3>
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: platform.color }}>
                      {platform.label}
                    </p>
                  </div>
                  {card.url && (
                    <button
                      onClick={() => window.open(card.url, '_blank', 'noopener')}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-gray-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
                      aria-label={`Open ${card.username} in new tab`}
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => removeStream(card.id)}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-gray-300 transition-colors hover:border-red-500/40 hover:text-red-400"
                    aria-label={`Remove ${card.username} from multi stream`}
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Player */}
                <div className="bg-black">
                  <div className="video-container" style={spansFull && count > 2 ? { paddingTop: '42%' } : undefined}>
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={`${card.username} stream`}
                        frameBorder="0"
                        scrolling="no"
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; clipboard-write; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500">
                        <PlatformIcon platform={card.platform} size={40} className="opacity-50" />
                        <p className="text-sm">No playable {platform.label} link provided.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
