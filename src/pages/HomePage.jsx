import { Play } from 'lucide-react'

export default function HomePage({ onNavigate }) {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-purple-600/[0.13] blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-56 h-64 w-64 rounded-full bg-red-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute left-[4%] top-[30rem] h-64 w-64 rounded-full bg-cyan-500/[0.07] blur-3xl" />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-20">
        <div className="animate-fade-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-gray-300 backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live streams from every platform
        </div>

        <h1
          className="animate-fade-up font-display mx-auto max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl"
          style={{ animationDelay: '0.05s' }}
        >
          All your favorite{' '}
          <span className="bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            streamers
          </span>
          , one place
        </h1>

        <p
          className="animate-fade-up mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg"
          style={{ animationDelay: '0.1s' }}
        >
          YouTube, Twitch and Kick streams all in one place. Click any card to jump straight into the
          live stream.
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: '0.15s' }}
        >
          <button
            onClick={() => onNavigate('streams')}
            className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 shadow-[0_8px_30px_-8px_rgba(255,255,255,0.4)] transition-all hover:scale-[1.03]"
          >
            <Play size={16} className="fill-zinc-900 transition-transform group-hover:scale-110" />
            Browse Streams
          </button>
          <button
            onClick={() => onNavigate('apply')}
            className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-bold text-white transition-all hover:border-white/25 hover:bg-white/[0.08]"
          >
            Apply to join
          </button>
        </div>

        <div
          className="animate-fade-up mx-auto mt-10 flex max-w-md items-center justify-center gap-6 text-xs font-medium text-gray-500 sm:gap-10"
          style={{ animationDelay: '0.2s' }}
        >
          <span>3 platforms</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Live embeds</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Free to watch</span>
        </div>
      </section>
    </div>
  )
}
