import { useState } from 'react'
import {
  LogOut,
  Trash2,
  PencilLine,
  LayoutDashboard,
  Sparkles,
  Eraser,
  Inbox,
  ExternalLink,
  Globe,
  CalendarPlus,
  PlusCircle,
  Layers,
  Users,
  Eye,
  Check,
  X,
  XCircle,
  CheckCircle2,
} from 'lucide-react'
import {
  loadCards,
  addCard,
  updateCard,
  deleteCard,
  deletePlaceholders,
  isPlaceholderCard,
} from '../lib/storage'
import {
  loadApplications,
  deleteApplication,
  setApplicationStatus,
} from '../lib/applications'
import { PLATFORMS, PLATFORM_KEYS } from '../lib/platforms'
import { getCardMenuItems } from '../lib/menuItems'
import CardForm from './CardForm'
import LivePreview from './LivePreview'
import PlatformIcon from './PlatformIcon'

function StatTile({ icon: Icon, label, value, accent = 'text-purple-400' }) {
  return (
    <div className="animate-fade-up rounded-2xl border border-white/[0.07] bg-[#121216] p-5">
      <Icon size={18} className={accent} />
      <div className="font-display mt-3 text-2xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </div>
    </div>
  )
}

export default function AdminDashboard({ onLogout, onContextMenu, onNavigate }) {
  const [cards, setCards] = useState(() => loadCards())
  const [applications, setApplications] = useState(() => loadApplications())
  const [activeSection, setActiveSection] = useState('create')
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmPlaceholders, setConfirmPlaceholders] = useState(false)
  const [appFilter, setAppFilter] = useState('all')
  const [reviewingApp, setReviewingApp] = useState(null)

  const placeholderCount = cards.filter(isPlaceholderCard).length
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const newThisWeek = cards.filter((c) => c.createdAt > weekAgo).length
  const pendingCount = applications.filter((a) => (a.status || 'pending') === 'pending').length

  const editingCard = editingId ? cards.find((c) => c.id === editingId) : null

  const SECTIONS = [
    { id: 'create', label: 'Create New Card', icon: PlusCircle },
    { id: 'published', label: 'Published Cards', icon: Layers, count: cards.length },
    { id: 'applications', label: 'Applications', icon: Users, count: pendingCount },
  ]

  const handleSave = (data) => {
    if (editingId) {
      setCards(updateCard(editingId, data))
      setEditingId(null)
    } else {
      setCards(addCard(data))
    }
    setDraft({})
  }

  const handleEdit = (id) => {
    setEditingId(id)
    setActiveSection('create')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    setCards(deleteCard(id))
    setConfirmDelete(null)
    if (editingId === id) setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setDraft({})
  }

  const handleDeletePlaceholders = () => {
    setCards(deletePlaceholders())
    setConfirmPlaceholders(false)
    setConfirmDelete(null)
  }

  const handleDeleteApplication = (id) => {
    setApplications(deleteApplication(id))
  }

  const handleSetStatus = (id, status) => {
    setApplications(setApplicationStatus(id, status))
    if (reviewingApp?.id === id) setReviewingApp((a) => (a ? { ...a, status, reviewedAt: Date.now() } : a))
  }

  const filteredApplications =
    appFilter === 'all'
      ? applications
      : applications.filter((a) => (a.status || 'pending') === appFilter)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="animate-fade-up mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-purple-400">
            <LayoutDashboard size={17} />
            <span className="text-xs font-bold uppercase tracking-widest">Admin Dashboard</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Manage Stream Cards
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create, preview and publish cards to the website.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <ExternalLink size={15} />
            View site
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={Sparkles}
          label="Published cards"
          value={cards.length}
          accent="text-cyan-400"
        />
        <StatTile icon={Inbox} label="Applications" value={applications.length} />
        <StatTile icon={Globe} label="Platforms" value={PLATFORM_KEYS.length} accent="text-red-400" />
        <StatTile
          icon={CalendarPlus}
          label="New this week"
          value={newThisWeek}
          accent="text-emerald-400"
        />
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-60 lg:shrink-0">
          <nav className="flex gap-1.5 overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#121216] p-2 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all lg:w-full ${
                    isActive
                      ? 'bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <section.icon size={17} />
                  <span className="whitespace-nowrap">{section.label}</span>
                  {typeof section.count === 'number' && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-white/[0.06] text-gray-500'
                      }`}
                    >
                      {section.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Create New Card */}
          {activeSection === 'create' && (
            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <CardForm
                key={editingId || 'new'}
                initial={editingCard}
                onSave={handleSave}
                onCancelEdit={handleCancelEdit}
                onDraftChange={setDraft}
              />
              <div className="xl:sticky xl:top-20 xl:self-start">
                <LivePreview draft={draft} />
              </div>
            </div>
          )}

          {/* Published Cards */}
          {activeSection === 'published' && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-white">
                    Published Cards
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {cards.length} {cards.length === 1 ? 'card' : 'cards'} on the website · right-click
                    a row for quick actions
                  </p>
                </div>
                {placeholderCount > 0 && (
                  <button
                    onClick={() => setConfirmPlaceholders(true)}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-400"
                  >
                    <Eraser size={14} />
                    Delete Placeholders ({placeholderCount})
                  </button>
                )}
              </div>

              {cards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-gray-500">
                    <PlusCircle size={20} />
                  </div>
                  <p className="text-sm text-gray-500">
                    No cards yet. Create your first card to publish it to the website.
                  </p>
                  <button
                    onClick={() => setActiveSection('create')}
                    className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.03]"
                  >
                    Create a card
                  </button>
                </div>
              ) : (
                <div className="max-h-[560px] space-y-3 overflow-y-auto rounded-2xl border border-white/[0.07] bg-black/30 p-3 pr-2">
                  {cards.map((card) => {
                    const platform = PLATFORMS[card.platform] || PLATFORMS.youtube
                    const isEditingThis = editingId === card.id
                    const isPlaceholder = isPlaceholderCard(card)
                    return (
                      <div
                        key={card.id}
                        onContextMenu={(e) => onContextMenu?.(e, getCardMenuItems(card))}
                        className={`flex items-center gap-4 rounded-xl border p-3 transition-colors ${
                          isEditingThis
                            ? 'border-purple-500/40 bg-purple-500/[0.08]'
                            : 'border-white/[0.07] bg-[#121216] hover:border-white/15'
                        }`}
                      >
                        <div
                          className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border"
                          style={{ borderColor: `${platform.color}40` }}
                        >
                          {card.image ? (
                            <img src={card.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center"
                              style={{ backgroundColor: platform.color }}
                            >
                              <PlatformIcon platform={card.platform} size={22} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display truncate text-[15px] font-semibold text-white">
                              {card.username}
                            </h3>
                            {isEditingThis && (
                              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                Editing
                              </span>
                            )}
                            {isPlaceholder && (
                              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                                Placeholder
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-gray-500">{card.description}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: platform.color }}
                            >
                              {platform.label}
                            </span>
                            {card.url && (
                              <span className="truncate text-[11px] text-gray-600">{card.url}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {card.url && (
                            <button
                              onClick={() => window.open(card.url, '_blank', 'noopener')}
                              className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 text-gray-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
                              aria-label={`Open ${card.username} in new tab`}
                              title="Open in new tab"
                            >
                              <ExternalLink size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(card.id)}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 text-gray-300 transition-colors hover:border-purple-500/40 hover:text-purple-400"
                            aria-label={`Edit ${card.username}`}
                            title="Edit"
                          >
                            <PencilLine size={15} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(card.id)}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 text-gray-300 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`Delete ${card.username}`}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Applications */}
          {activeSection === 'applications' && (
            <div>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-white">
                    Applications
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {pendingCount} pending · {applications.length} total requests from the Apply page
                  </p>
                </div>
                <div className="flex gap-1.5 overflow-x-auto">
                  {[
                    { id: 'all', label: `All (${applications.length})` },
                    { id: 'pending', label: `Pending (${pendingCount})` },
                    {
                      id: 'approved',
                      label: `Approved (${applications.filter((a) => (a.status || 'pending') === 'approved').length})`,
                    },
                    {
                      id: 'rejected',
                      label: `Rejected (${applications.filter((a) => (a.status || 'pending') === 'rejected').length})`,
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setAppFilter(f.id)}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        appFilter === f.id
                          ? 'bg-white text-zinc-900'
                          : 'bg-white/[0.04] text-gray-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredApplications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-14 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-gray-500">
                    <Inbox size={20} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {appFilter === 'all'
                      ? 'No applications yet. Submissions from the Apply page will appear here.'
                      : `No ${appFilter} applications.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApplications.map((app) => {
                    const platform = PLATFORMS[app.platform] || PLATFORMS.youtube
                    const date = new Date(app.createdAt).toLocaleDateString()
                    const status = app.status || 'pending'
                    return (
                      <div
                        key={app.id}
                        className={`flex flex-wrap items-start gap-4 rounded-xl border p-4 ${
                          status === 'approved'
                            ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
                            : status === 'rejected'
                              ? 'border-red-500/25 bg-red-500/[0.06]'
                              : 'border-white/[0.07] bg-[#121216]'
                        }`}
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${platform.color}22`, color: platform.color }}
                        >
                          <PlatformIcon platform={app.platform} size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-[15px] font-semibold text-white">
                              {app.name}
                            </h3>
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: platform.color }}
                            >
                              {platform.label}
                            </span>
                            <span className="text-[11px] text-gray-600">{date}</span>
                            {status === 'approved' && (
                              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                <Check size={10} /> Approved
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                                <X size={10} /> Rejected
                              </span>
                            )}
                            {status === 'pending' && (
                              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                                Pending
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                app.mode === 'multi'
                                  ? 'bg-cyan-500/20 text-cyan-400'
                                  : 'bg-white/[0.06] text-gray-400'
                              }`}
                            >
                              {app.mode === 'multi' ? 'Multi Stream' : 'Single Stream'}
                            </span>
                            {app.autoAdded && (
                              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                <Check size={10} /> Auto-added
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                            {app.link && (
                              <a
                                href={app.link}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="truncate text-purple-400 hover:text-purple-300"
                              >
                                {app.link}
                              </a>
                            )}
                            {app.discord && (
                              <span className="truncate text-indigo-400">@{app.discord}</span>
                            )}
                            {!app.discord && app.email && (
                              <span className="truncate">{app.email}</span>
                            )}
                          </div>
                          {app.message && (
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                              {app.message}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => setReviewingApp(app)}
                            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
                          >
                            <Eye size={14} />
                            Review
                          </button>
                          {status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleSetStatus(app.id, 'approved')}
                                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/25"
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleSetStatus(app.id, 'rejected')}
                                className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/25"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSetStatus(app.id, 'pending')}
                              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-gray-400 transition-colors hover:border-yellow-500/40 hover:text-yellow-400"
                            >
                              Reset
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteApplication(app.id)}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 text-gray-300 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`Delete application from ${app.name}`}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete placeholders confirmation modal */}
      {confirmPlaceholders && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setConfirmPlaceholders(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121216] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400">
              <Eraser size={22} />
            </div>
            <h3 className="font-display text-lg font-semibold text-white">Delete all placeholders?</h3>
            <p className="mt-1 text-sm text-gray-500">
              This will permanently remove {placeholderCount} placeholder card
              {placeholderCount === 1 ? '' : 's'}. Your own cards will be kept.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmPlaceholders(false)}
                className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlaceholders}
                className="flex-1 rounded-xl bg-yellow-500 py-2.5 text-sm font-bold text-black transition-colors hover:bg-yellow-400"
              >
                Delete Placeholders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121216] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <Trash2 size={22} />
            </div>
            <h3 className="font-display text-lg font-semibold text-white">Delete this card?</h3>
            <p className="mt-1 text-sm text-gray-500">
              This will remove the card from the website permanently.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full review modal */}
      {reviewingApp && (() => {
        const platform = PLATFORMS[reviewingApp.platform] || PLATFORMS.youtube
        const status = reviewingApp.status || 'pending'
        const date = new Date(reviewingApp.createdAt).toLocaleDateString()
        const reviewedDate = reviewingApp.reviewedAt
          ? new Date(reviewingApp.reviewedAt).toLocaleDateString()
          : null
        const fields = [
          { label: 'Streamer name', value: reviewingApp.name },
          { label: 'Platform', value: platform.label },
          { label: 'Stream type', value: reviewingApp.mode === 'multi' ? 'Multi Stream' : 'Single Stream' },
          { label: 'Channel link', value: reviewingApp.link },
          { label: 'Discord username', value: reviewingApp.discord ? `@${reviewingApp.discord}` : '' },
          { label: 'Submitted', value: date },
          { label: 'Reviewed', value: reviewedDate },
          { label: 'Why should they be featured?', value: reviewingApp.message, full: true },
        ]
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setReviewingApp(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${platform.color}22`, color: platform.color }}
                  >
                    <PlatformIcon platform={reviewingApp.platform} size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {reviewingApp.name}
                    </h3>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: platform.color }}>
                      {platform.label}
                    </span>
                  </div>
                </div>
                {status === 'approved' && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <Check size={11} /> Approved
                  </span>
                )}
                {status === 'rejected' && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                    <X size={11} /> Rejected
                  </span>
                )}
                {status === 'pending' && (
                  <span className="shrink-0 rounded-full bg-yellow-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                    Pending
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {fields.map((f) => (
                  <div key={f.label}>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {f.label}
                    </div>
                    {f.full ? (
                      <p className="whitespace-pre-wrap rounded-lg border border-white/[0.07] bg-black/30 p-3 text-sm leading-relaxed text-gray-200">
                        {f.value || <span className="text-gray-600">—</span>}
                      </p>
                    ) : f.label === 'Channel link' && f.value ? (
                      <a
                        href={f.value}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-sm font-semibold text-purple-300 transition-colors hover:bg-purple-500/20"
                      >
                        <ExternalLink size={14} />
                        <span className="truncate">{f.value}</span>
                      </a>
                    ) : (
                      <div className="text-sm text-gray-200">
                        {f.value || <span className="text-gray-600">—</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.07] pt-5">
                {status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleSetStatus(reviewingApp.id, 'rejected')}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2.5 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/25"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleSetStatus(reviewingApp.id, 'approved')}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/25"
                    >
                      <CheckCircle2 size={15} />
                      Approve
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleSetStatus(reviewingApp.id, 'pending')}
                    className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:text-white"
                  >
                    Reset to pending
                  </button>
                )}
                <button
                  onClick={() => setReviewingApp(null)}
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 transition-transform hover:scale-[1.03]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
