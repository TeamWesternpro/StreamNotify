import { useState } from 'react'
import { FileText, CheckCircle2, Send, ArrowLeft } from 'lucide-react'
import { submitApplication } from '../lib/applications'
import { PLATFORMS, PLATFORM_KEYS } from '../lib/platforms'
import PlatformIcon from '../components/PlatformIcon'

const EMPTY = {
  name: '',
  platform: 'youtube',
  link: '',
  discord: '',
  message: '',
}

export default function ApplyPage({ onNavigate }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Your streamer name is required.')
    if (!form.link.trim()) return setError('A link to your channel is required.')
    submitApplication({ ...form, name: form.name.trim() })
    setSubmitted(true)
    setError('')
  }

  const reset = () => {
    setForm(EMPTY)
    setSubmitted(false)
  }

  return (
    <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="animate-fade-up mb-2 flex items-center gap-2 text-purple-400">
          <FileText size={17} />
          <span className="text-xs font-bold uppercase tracking-widest">Apply</span>
        </div>
        <h1 className="animate-fade-up font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Apply to appear on StreamNotify
        </h1>
        <p className="animate-fade-up mt-2 max-w-xl text-sm text-gray-500">
          Get your channel featured on our site. Pick a platform, submit your application and we'll
          review it as soon as possible.
        </p>
      </div>

      {/* Platform navbar */}
      {!submitted && (
        <div className="animate-fade-up mb-6" style={{ animationDelay: '0.05s' }}>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Which platform are you applying for?</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PLATFORM_KEYS.map((key) => {
              const p = PLATFORMS[key]
              const active = form.platform === key
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => set('platform', key)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'border-transparent text-white shadow-lg'
                      : 'border-white/[0.07] bg-white/[0.04] text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                  style={
                    active
                      ? { backgroundColor: p.color, boxShadow: `0 4px 20px -4px ${p.color}66` }
                      : undefined
                  }
                >
                  <PlatformIcon platform={key} size={16} className={active ? 'text-white' : ''} />
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {submitted ? (
        <div className="animate-fade-up rounded-2xl border border-white/[0.07] bg-[#121216] p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white">Application received!</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            Thanks {form.name}! Your application for{' '}
            <span className="inline-flex items-center gap-1.5 align-baseline font-semibold text-white">
              <PlatformIcon
                platform={form.platform}
                size={14}
                className="align-baseline"
                style={{ color: PLATFORMS[form.platform].color }}
              />
              {PLATFORMS[form.platform].label}
            </span>{' '}
            has been submitted. We'll be in touch on Discord
            {form.discord ? (
              <span className="font-semibold text-white"> (@{form.discord})</span>
            ) : (
              ' soon'
            )}
            .
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <button
              onClick={reset}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.03]"
            >
              Submit another
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="rounded-xl border border-white/[0.12] px-5 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:text-white"
            >
              Back to home
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up space-y-5 rounded-2xl border border-white/[0.07] bg-[#121216] p-6 sm:p-8"
          style={{ animationDelay: '0.05s' }}
        >
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Streamer name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. xQc"
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
            />
          </div>

          {/* Link */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Channel link *
            </label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => set('link', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
            />
          </div>

          {/* Discord */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Discord username <span className="font-medium normal-case text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              value={form.discord}
              onChange={(e) => set('discord', e.target.value)}
              placeholder="e.g. yourname"
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Why should you be featured?
            </label>
            <textarea
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              rows={4}
              placeholder="Tell us a little about your channel..."
              className="w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-gray-600">
              Fields marked * are required.
            </p>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <Send size={15} />
              Submit Application
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-white"
          >
            <ArrowLeft size={13} />
            Back to home
          </button>
        </form>
      )}
    </div>
  )
}
