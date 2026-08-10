import { useState } from 'react'
import { RadioTower } from 'lucide-react'
import Navbar from './components/Navbar'
import VideoModal from './components/VideoModal'
import ScrollToTop from './components/ScrollToTop'
import ContextMenu from './components/ContextMenu'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import HomePage from './pages/HomePage'
import StreamsPage from './pages/StreamsPage'
import ApplyPage from './pages/ApplyPage'
import AboutPage from './pages/AboutPage'
import MultiViewPage from './pages/MultiViewPage'

const AUTH_KEY = 'streamnotify_admin_auth'
const ADMIN_USERNAME = 'administrator'
const ADMIN_PASSWORD = 'StreamNotify!2026'

function getAuth() {
  try {
    return sessionStorage.getItem(AUTH_KEY) === 'true'
  } catch {
    return false
  }
}

function Footer({ onNavigate }) {
  return (
    <footer className="relative border-t border-white/[0.06] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 via-purple-500 to-cyan-400">
            <RadioTower size={14} className="text-white" />
          </span>
          StreamNotify
        </button>
        <nav className="flex items-center gap-5 text-xs text-gray-500">
          {[
            ['Streams', 'streams'],
            ['Apply', 'apply'],
            ['About', 'about'],
            ['Admin', 'admin'],
          ].map(([label, id]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="transition-colors hover:text-white"
            >
              {label}
            </button>
          ))}
        </nav>
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} StreamNotify
        </p>
      </div>
    </footer>
  )
}

function App() {
  const [page, setPage] = useState('home')
  const [streamFilter, setStreamFilter] = useState('all')
  const [multiIds, setMultiIds] = useState([])
  const [isAuthed, setIsAuthed] = useState(() => getAuth())
  const [activeCard, setActiveCard] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  const openContextMenu = (e, items) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, items })
  }

  const closeContextMenu = () => setContextMenu(null)

  const handleNavigate = (target, param) => {
    if (target === 'streams') setStreamFilter(param || 'all')
    if (target === 'multi') setMultiIds(Array.isArray(param) ? param : [])
    setPage(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogin = (username, password) => {
    const ok = username === ADMIN_USERNAME && password === ADMIN_PASSWORD
    if (ok) {
      try {
        sessionStorage.setItem(AUTH_KEY, 'true')
      } catch {
        // ignore
      }
      setIsAuthed(true)
    }
    return ok
  }

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY)
    } catch {
      // ignore
    }
    setIsAuthed(false)
    handleNavigate('home')
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#09090b]">
      <div className="pointer-events-none absolute inset-0 bg-grid" />

      <Navbar view={page} onNavigate={handleNavigate} />

      <main className="relative flex-1">
        {page === 'home' && <HomePage onNavigate={handleNavigate} />}
        {page === 'streams' && (
          <StreamsPage
            key={streamFilter}
            initialFilter={streamFilter}
            onOpenCard={setActiveCard}
            onContextMenu={openContextMenu}
            onOpenMulti={(ids) => handleNavigate('multi', ids)}
          />
        )}
        {page === 'multi' && (
          <MultiViewPage ids={multiIds} onNavigate={handleNavigate} />
        )}
        {page === 'apply' && <ApplyPage onNavigate={handleNavigate} />}
        {page === 'about' && <AboutPage onNavigate={handleNavigate} />}
        {page === 'admin' &&
          (isAuthed ? (
            <AdminDashboard
              onLogout={handleLogout}
              onContextMenu={openContextMenu}
              onNavigate={handleNavigate}
            />
          ) : (
            <Login onLogin={handleLogin} />
          ))}
      </main>

      <Footer onNavigate={handleNavigate} />

      <ScrollToTop />
      <VideoModal card={activeCard} onClose={() => setActiveCard(null)} />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={closeContextMenu}
        />
      )}
    </div>
  )
}

export default App
