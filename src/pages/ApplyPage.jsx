import { useState, useRef } from 'react'
import {
  FileText,
  CheckCircle2,
  Send,
  ArrowLeft,
  AlertTriangle,
  MonitorPlay,
  Columns3,
  Upload,
  ImagePlus,
  Trash2,
} from 'lucide-react'
import { submitApplication } from '../lib/applications'
import { loadCards, addCard, MAX_CARDS } from '../lib/storage'
import { PLATFORMS, PLATFORM_KEYS } from '../lib/platforms'
import PlatformIcon from '../components/PlatformIcon'

const EMPTY = {
  name: '',
  platform: 'youtube',
  link: '',
  discord: '',
  message: '',
  mode: 'single',
  image: '',
}

export default function ApplyPage({ onNavigate }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef(null)

  const cards = loadCards()
  const remaining = MAX_CARDS - cards.length
  const atLimit = remaining <= 0

  const duplicate = cards.find(
    (c) =>
      c.platform === form.platform &&
      c.username.trim().toLowerCase() === form.name.trim().toLowerCase(),
  )

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP, GIF).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image is too large. Please upload an image under 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      set('image', e.target.result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (atLimit)
      return setError(
        `The website is full — we've reached the limit of ${MAX_CARDS} streamers.`,
      )
    if (!form.name.trim()) return setError('Your streamer name is required.')
    if (!form.link.trim()) return setError('A link to your channel is required.')
    if (duplicate)
      return setError(
        `"${duplicate.username}" has already been added on ${PLATFORMS[form.platform].label}.`,
      )
    const cardData = {
      username: form.name.trim(),
      platform: form.platform,
      url: form.link.trim(),
      description: form.message.trim() || `Featured on ${PLATFORMS[form.platform].label}`,
      mode: form.mode,
      image: form.image,
    }
    addCard(cardData)
    submitApplication({
      ...form,
      name: form.name.trim(),
      link: form.link.trim(),
      status: 'approved',
      autoAdded: true,
    })
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
          Get your channel featured on our site. Pick a platform, add your link and submit — you'll
          appear on the Streams page right away.
        </p>
        {!submitted && (
          <div
            className={`animate-fade-up mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              atLimit
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-white/[0.08] bg-white/[0.04] text-gray-400'
            }`}
          >
            {atLimit
              ? 'No slots left — the site has reached its limit'
              : `${remaining} of ${MAX_CARDS} streamer slots remaining`}
          </div>
        )}
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
            has been submitted as a{' '}
            <span className="font-semibold text-white">
              {form.mode === 'multi' ? 'Multi Stream' : 'Single Stream'}
            </span>{' '}
            and is now live on the Streams page. We'll be in touch on Discord
            {form.discord ? (
              <span className="font-semibold text-white"> (@{form.discord})</span>
            ) : (
              ' soon'
            )}
            .
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('streams')}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.03]"
            >
              View on Streams
            </button>
            <button
              onClick={reset}
              className="rounded-xl border border-white/[0.12] px-5 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:text-white"
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
            {form.name.trim() && duplicate && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-400">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <span>
                  <strong className="font-semibold text-amber-300">{duplicate.username}</strong> has
                  already been added on {PLATFORMS[duplicate.platform].label}.{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('streams')}
                    className="font-semibold underline underline-offset-2 transition-colors hover:text-amber-300"
                  >
                    View on the Streams page
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Stream type */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              How should this streamer be added? *
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                {
                  id: 'single',
                  label: 'Single Stream',
                  desc: 'A single stream card on the website.',
                  icon: MonitorPlay,
                },
                {
                  id: 'multi',
                  label: 'Multi Stream',
                  desc: 'Play together with other platforms at once.',
                  icon: Columns3,
                },
              ].map((opt) => {
                const active = form.mode === opt.id
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => set('mode', opt.id)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      active
                        ? 'border-transparent bg-gradient-to-r from-purple-500/20 to-cyan-400/20 ring-1 ring-purple-500/60'
                        : 'border-white/[0.07] bg-white/[0.04] hover:border-white/20'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        active ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-white' : 'bg-white/[0.06] text-gray-400'
                      }`}
                    >
                      <opt.icon size={18} />
                    </span>
                    <span>
                      <span className={`block text-sm font-semibold ${active ? 'text-white' : 'text-gray-200'}`}>
                        {opt.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500">{opt.desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
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

          {/* Image upload */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Banner image <span className="font-medium normal-case text-gray-600">(optional)</span>
            </label>
            {form.image ? (
              <div className="relative overflow-hidden rounded-xl border border-white/[0.07]">
                <img src={form.image} alt="Uploaded banner preview" className="h-36 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('image', '')}
                  className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-red-500/80"
                  aria-label="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  handleFile(e.dataTransfer.files?.[0])
                }}
                className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
                  dragOver
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/25'
                }`}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${PLATFORMS[form.platform].color}22`, color: PLATFORMS[form.platform].color }}
                >
                  {dragOver ? <Upload size={20} /> : <ImagePlus size={20} />}
                </span>
                <span className="text-sm font-semibold text-white">Click or drag & drop to upload</span>
                <span className="text-xs text-gray-500">JPG, PNG, WebP or GIF · max 2MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
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
              disabled={atLimit}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-transform ${
                atLimit
                  ? 'cursor-not-allowed border border-amber-500/30 bg-white/[0.04] text-amber-400/70'
                  : 'bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 text-white hover:scale-[1.03] active:scale-[0.98]'
              }`}
            >
              <Send size={15} />
              {atLimit ? 'Limit reached' : 'Submit Application'}
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
