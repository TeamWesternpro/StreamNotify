import { useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { PLATFORMS, platformGradient } from '../lib/platforms'
import { buildEmbedUrl } from '../lib/embeds'
import PlatformIcon from './PlatformIcon'

export default function VideoModal({ card, onClose }) {
  useEffect(() => {
    if (!card) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [card, onClose])

  if (!card) return null
  const platform = PLATFORMS[card.platform] || PLATFORMS.youtube
  const embedUrl = buildEmbedUrl(card.platform, card.url)

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 overflow-y-auto bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex min-h-full items-center justify-center py-4"
        onClick={onClose}
      >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#101116] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'popIn 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/[0.08] bg-white/[0.02] px-5 py-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: platformGradient(card.platform) }}
          >
            <PlatformIcon platform={card.platform} size={22} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display truncate text-xl font-semibold tracking-tight text-white">
              {card.username}
            </h2>
            <p className="text-sm text-gray-500">
              <span className="font-semibold" style={{ color: platform.color }}>
                {platform.label}
              </span>{' '}
              · Live Stream
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/[0.06] p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Player */}
        <div className="bg-black">
          <div className="video-container">
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
                <PlatformIcon platform={card.platform} size={48} className="opacity-50" />
                <p className="text-sm">No playable {platform.label} link provided.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-gray-500">
              {card.description || 'No description provided.'}
            </p>
          </div>
          <a
            href={card.url}
            target="_blank"
            rel="noreferrer noopener"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: platform.color }}
          >
            <ExternalLink size={15} />
            Open on {platform.label}
          </a>
        </div>
      </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
