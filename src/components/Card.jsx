import { Play, ArrowUpRight, Check } from 'lucide-react'
import { PLATFORMS, platformGradient } from '../lib/platforms'
import { getCardMenuItems } from '../lib/menuItems'
import PlatformIcon from './PlatformIcon'

export default function Card({
  card,
  onOpen,
  preview = false,
  onContextMenu,
  selectable = false,
  selected = false,
  onToggle,
}) {
  const platform = PLATFORMS[card.platform] || PLATFORMS.youtube

  const handleClick = () => {
    if (preview) return
    if (selectable) return onToggle?.(card)
    onOpen(card)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      onClick={handleClick}
      onContextMenu={
        preview || !onContextMenu
          ? undefined
          : (e) => onContextMenu(e, getCardMenuItems(card))
      }
      role={preview ? undefined : 'button'}
      tabIndex={preview ? undefined : 0}
      onKeyDown={preview ? undefined : handleKeyDown}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        preview
          ? 'border-white/[0.07] bg-[#121216]'
          : selectable
            ? `cursor-pointer ${
                selected
                  ? 'border-purple-500/70 ring-2 ring-purple-500/50'
                  : 'border-white/[0.07] hover:border-white/25'
              } bg-[#121216]`
            : 'cursor-pointer border-white/[0.07] bg-[#121216] hover:-translate-y-1.5'
      } shadow-${card.platform}`}
    >
      {/* Banner */}
      <div className="relative h-40 overflow-hidden">
        {card.image ? (
          <img
            src={card.image}
            alt={`${card.username} banner`}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out ${
              preview ? '' : 'group-hover:scale-105'
            }`}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: platformGradient(card.platform) }}
          >
            <PlatformIcon platform={card.platform} size={64} className="opacity-40" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/40 to-transparent" />

        {/* Live badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-400 backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          Live
        </div>

        {/* Platform badge */}
        <div
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg backdrop-blur"
          style={{ backgroundColor: `${platform.color}2e`, border: `1px solid ${platform.color}59` }}
          title={platform.label}
        >
          <PlatformIcon platform={card.platform} size={15} className="text-white" />
        </div>

        {/* Selection check */}
        {selectable && (
          <div
            className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition-all ${
              selected
                ? 'border-purple-400 bg-purple-500 text-white shadow-[0_0_16px_rgba(168,85,247,0.6)]'
                : 'border-white/25 bg-black/40 text-transparent'
            }`}
          >
            <Check size={16} strokeWidth={3} />
          </div>
        )}

        {/* Play overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            preview
              ? ''
              : selectable
                ? 'bg-black/20'
                : 'bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur transition-transform duration-300 ${
              selectable ? '' : 'group-hover:scale-110'
            }`}
            style={{ backgroundColor: platform.color, boxShadow: `0 0 24px ${platform.color}80` }}
          >
            <Play size={19} className="ml-0.5 fill-white text-white" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: platform.color, boxShadow: `0 0 8px ${platform.color}` }}
          />
          <h3 className="truncate font-display text-[17px] font-semibold text-white">
            {card.username}
          </h3>
        </div>

        <p className="line-clamp-2 flex-1 text-[13px] leading-relaxed text-gray-500">
          {card.description || 'No description provided.'}
        </p>

        <div className="mt-1 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            {platform.label}
          </span>
          {!preview && (
            <span
              className={`flex items-center gap-1 text-[12px] font-semibold transition-colors ${
                selectable
                  ? selected
                    ? 'text-purple-400'
                    : 'text-gray-300 group-hover:text-white'
                  : 'text-gray-300 group-hover:text-white'
              }`}
            >
              {selectable ? (selected ? 'Selected' : 'Select') : 'Watch now'}
              <ArrowUpRight
                size={13}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
