import { RadioTower, MonitorPlay, FileText, Info, LayoutDashboard, Home } from 'lucide-react'

const LINKS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'streams', label: 'Streams', icon: MonitorPlay },
  { id: 'apply', label: 'Apply', icon: FileText },
  { id: 'about', label: 'About', icon: Info },
]

export default function Navbar({ view, onNavigate }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <button onClick={() => onNavigate('home')} className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-purple-500 to-cyan-400 shadow-[0_4px_16px_-4px_rgba(168,85,247,0.5)] transition-transform group-hover:scale-105">
            <RadioTower size={19} className="text-white" />
          </span>
          <span className="font-display hidden text-xl font-bold tracking-tight text-white min-[400px]:inline">
            Stream<span className="bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">Notify</span>
          </span>
        </button>

        <nav className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.04] p-1">
          {LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
                view === link.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <link.icon size={15} />
              <span className="hidden sm:inline">{link.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => onNavigate('admin')}
          className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
            view === 'admin'
              ? 'border-transparent bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 text-white shadow-lg'
              : 'border-white/[0.1] bg-white/[0.04] text-gray-300 hover:border-white/25 hover:text-white'
          }`}
        >
          <LayoutDashboard size={15} />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>
    </header>
  )
}
