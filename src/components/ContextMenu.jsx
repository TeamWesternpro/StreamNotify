import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ left: x, top: y })

  useLayoutEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    let left = x
    let top = y
    if (left + rect.width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - rect.width - 8)
    }
    if (top + rect.height > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - rect.height - 8)
    }
    setPos({ left, top })
  }, [x, y, items])

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (ref.current && ref.current.contains(e.target)) return
      onClose()
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const handleScroll = () => onClose()
    window.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-[70] w-56 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a21] p-1.5 shadow-2xl"
      style={{ left: pos.left, top: pos.top, animation: 'fadeIn 0.12s ease-out' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          role="menuitem"
          onClick={() => {
            item.action()
            onClose()
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <item.icon size={15} className="shrink-0 text-gray-500" />
          {item.label}
        </button>
      ))}
    </div>
  )
}
