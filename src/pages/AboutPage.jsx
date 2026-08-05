import { RadioTower, Users, Globe2, Eye, Zap, HeartHandshake } from 'lucide-react'
import { PLATFORMS, PLATFORM_KEYS } from '../lib/platforms'
import PlatformIcon from '../components/PlatformIcon'

const FEATURES = [
  {
    icon: Globe2,
    title: 'One place, every platform',
    text: 'YouTube, Twitch and Kick streams all in a single, clean interface.',
  },
  {
    icon: Eye,
    title: 'Live embeds',
    text: 'Click any card to watch the stream right here — no need to hop between sites.',
  },
  {
    icon: Zap,
    title: 'Built for speed',
    text: 'A lightweight, fast experience that loads instantly on any device.',
  },
  {
    icon: HeartHandshake,
    title: 'Grow your channel',
    text: 'Apply to be featured and reach a whole new audience of viewers.',
  },
]

export default function AboutPage({ onNavigate }) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-purple-600/[0.12] blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-14 sm:px-6">
        {/* Intro */}
        <section className="text-center">
          <div className="animate-fade-up mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-purple-500 to-cyan-400 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.6)]">
            <RadioTower size={30} className="text-white" />
          </div>
          <h1 className="animate-fade-up font-display text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ animationDelay: '0.05s' }}>
            About <span className="bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">StreamNotify</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400" style={{ animationDelay: '0.1s' }}>
            StreamNotify is a curated directory of live streamers. We bring the best channels from
            YouTube, Twitch and Kick together in one place, so viewers can discover someone
            new — and watch them instantly.
          </p>
        </section>

        {/* Stats */}
        <section className="animate-fade-up mt-14 grid grid-cols-3 gap-4" style={{ animationDelay: '0.15s' }}>
          {[
            { icon: Globe2, value: '4', label: 'Platforms' },
            { icon: Users, value: '∞', label: 'Streamers' },
            { icon: Eye, value: '24/7', label: 'Live embeds' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/[0.07] bg-[#121216] p-6 text-center"
            >
              <s.icon size={20} className="mx-auto mb-3 text-purple-400" />
              <div className="font-display text-3xl font-bold text-white">{s.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                {s.label}
              </div>
            </div>
          ))}
        </section>

        {/* Platforms */}
        <section className="mt-14">
          <h2 className="font-display mb-6 text-center text-2xl font-semibold tracking-tight text-white">
            Platforms we support
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {PLATFORM_KEYS.map((key, i) => {
              const p = PLATFORMS[key]
              return (
                <div
                  key={key}
                  className="animate-fade-up rounded-2xl border border-white/[0.07] bg-[#121216] p-6 text-center"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${p.color}22`, color: p.color }}
                  >
                    <PlatformIcon platform={key} size={24} />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-white">{p.label}</h3>
                </div>
              )
            })}
          </div>
        </section>

        {/* Features */}
        <section className="mt-14">
          <h2 className="font-display mb-6 text-center text-2xl font-semibold tracking-tight text-white">
            Why StreamNotify?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="animate-fade-up rounded-2xl border border-white/[0.07] bg-[#121216] p-6"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <f.icon size={18} />
                </div>
                <h3 className="font-display text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="animate-fade-up mt-14 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#15151b] to-[#121216] p-10 text-center" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display text-2xl font-semibold text-white">
            Want your channel featured?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Join StreamNotify and get discovered by new viewers across every platform.
          </p>
          <button
            onClick={() => onNavigate('apply')}
            className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 shadow-[0_8px_30px_-8px_rgba(255,255,255,0.4)] transition-all hover:scale-[1.03]"
          >
            Apply to join
          </button>
        </section>
      </div>
    </div>
  )
}
