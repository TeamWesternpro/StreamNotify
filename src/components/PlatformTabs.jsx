import { Globe } from 'lucide-react'
import { PLATFORMS, PLATFORM_KEYS } from '../lib/platforms'
import PlatformIcon from './PlatformIcon'

const ALL = 'all'

export default function PlatformTabs({ active, onChange, counts = {} }) {
  const tabs = [
    { id: ALL, label: 'All', color: '#ffffff' },
    ...PLATFORM_KEYS.map((key) => ({ id: key, label: PLATFORMS[key].label, color: PLATFORMS[key].color })),
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
              isActive
                ? 'border-transparent text-white shadow-lg'
                : 'border-white/[0.07] bg-white/[0.04] text-gray-400 hover:border-white/20 hover:text-white'
            }`}
            style={
              isActive
                ? { backgroundColor: tab.color, boxShadow: `0 4px 20px -4px ${tab.color}66` }
                : undefined
            }
          >
            {tab.id === ALL ? (
              <Globe size={15} className={isActive ? 'text-white' : ''} />
            ) : (
              <PlatformIcon platform={tab.id} size={15} className={isActive ? 'text-white' : ''} />
            )}
            {tab.label}
            {typeof counts[tab.id] === 'number' && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-white/[0.06] text-gray-500'
                }`}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
