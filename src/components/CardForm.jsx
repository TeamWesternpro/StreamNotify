import { useEffect, useRef, useState } from 'react'
import { Upload, Trash2, ImagePlus, Save, PencilLine } from 'lucide-react'
import { PLATFORMS, PLATFORM_KEYS, PLATFORM_HINTS } from '../lib/platforms'
import PlatformIcon from './PlatformIcon'

export default function CardForm({ initial, onSave, onCancelEdit, onDraftChange }) {
  const [draft, setDraft] = useState({
    username: initial?.username || '',
    description: initial?.description || '',
    platform: initial?.platform || 'youtube',
    url: initial?.url || '',
    image: initial?.image || '',
  })
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const isEditing = Boolean(initial?.id)

  useEffect(() => {
    setDraft({
      username: initial?.username || '',
      description: initial?.description || '',
      platform: initial?.platform || 'youtube',
      url: initial?.url || '',
      image: initial?.image || '',
    })
  }, [initial])

  useEffect(() => {
    onDraftChange?.(draft)
  }, [draft, onDraftChange])

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

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
    if (!draft.username.trim()) {
      setError('Username is required.')
      return
    }
    if (!draft.url.trim()) {
      setError('A stream / video link is required.')
      return
    }
    onSave(draft)
    if (!isEditing) {
      setDraft({ username: '', description: '', platform: 'youtube', url: '', image: '' })
    }
    setError('')
  }

  const selected = PLATFORMS[draft.platform]

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-white/[0.07] bg-[#121216] p-6 sm:p-7"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <h2 className="font-display text-lg font-semibold tracking-tight text-white">
          {isEditing ? 'Edit Card' : 'Create New Card'}
        </h2>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-white"
          >
            Cancel edit
          </button>
        )}
      </div>

      {/* Username */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
          Username
        </label>
        <input
          type="text"
          value={draft.username}
          onChange={(e) => set('username', e.target.value)}
          placeholder="e.g. xQc"
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
          Description
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          placeholder="What is this streamer about?"
          className="w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
        />
      </div>

      {/* Platform */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
          Platform
        </label>
        <div className="grid grid-cols-4 gap-2">
          {PLATFORM_KEYS.map((key) => {
            const p = PLATFORMS[key]
            const active = draft.platform === key
            return (
              <button
                type="button"
                key={key}
                onClick={() => set('platform', key)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-all ${
                  active
                    ? 'border-transparent text-white shadow-lg'
                    : 'border-white/[0.07] bg-white/[0.04] text-gray-400 hover:border-white/20 hover:text-white'
                }`}
                style={
                  active
                    ? { backgroundColor: p.color, boxShadow: `0 4px 16px ${p.color}66` }
                    : undefined
                }
              >
                <PlatformIcon platform={key} size={20} className={active ? 'text-white' : ''} />
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* URL */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
          Stream / Video Link
        </label>
        <input
          type="url"
          value={draft.url}
          onChange={(e) => set('url', e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
        />
        <p className="mt-1.5 text-xs text-gray-500" style={{ color: `${selected.color}cc` }}>
          {PLATFORM_HINTS[draft.platform]}
        </p>
      </div>

      {/* Image upload */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
          Banner Image
        </label>
        {draft.image ? (
          <div className="relative overflow-hidden rounded-xl border border-white/[0.07]">
            <img src={draft.image} alt="Uploaded banner preview" className="h-36 w-full object-cover" />
            <div className="absolute right-2 top-2 flex gap-2">
              <button
                type="button"
                onClick={() => set('image', '')}
                className="rounded-lg bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-red-500/80"
                aria-label="Remove image"
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
                aria-label="Replace image"
              >
                <PencilLine size={14} />
              </button>
            </div>
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
              style={{ backgroundColor: `${selected.color}22`, color: selected.color }}
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

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isEditing ? <Save size={16} /> : <Upload size={16} />}
        {isEditing ? 'Update Card' : 'Add Card'}
      </button>
    </form>
  )
}
