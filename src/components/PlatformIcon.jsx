import { PLATFORMS } from '../lib/platforms'

export default function PlatformIcon({ platform, size = 24, className = '' }) {
  const p = PLATFORMS[platform]
  if (!p) return null
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-label={p.label}
      className={className}
    >
      <path d={p.iconPath} />
    </svg>
  )
}
