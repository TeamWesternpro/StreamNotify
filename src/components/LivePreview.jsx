import { Eye } from 'lucide-react'
import Card from './Card'

export default function LivePreview({ draft }) {
  const previewCard = {
    id: 'preview',
    username: draft?.username?.trim() || 'Your Username',
    description:
      draft?.description?.trim() ||
      'Your card description will appear here. Keep it short and catchy!',
    platform: draft?.platform || 'youtube',
    url: draft?.url || '',
    image: draft?.image || '',
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.07] bg-[#121216] p-6 sm:p-7">
      <div className="border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
            <Eye size={16} />
          </span>
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            Live Preview
          </h2>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          This is exactly how your card will look on the website.
        </p>
      </div>

      <div className="mx-auto max-w-sm pt-1">
        <Card card={previewCard} onOpen={() => {}} preview />
      </div>

      <p className="text-center text-[11px] text-gray-600">
        Tip: left-click opens the video · right-click opens quick actions
      </p>
    </div>
  )
}
