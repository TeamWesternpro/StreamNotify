import { ExternalLink, Play, Copy, Link2 } from 'lucide-react'
import { buildEmbedUrl } from './embeds'

export function getCardMenuItems(card) {
  const embed = buildEmbedUrl(card.platform, card.url)
  return [
    {
      label: 'Open stream in new tab',
      icon: ExternalLink,
      action: () => {
        if (card.url) window.open(card.url, '_blank', 'noopener')
      },
    },
    {
      label: 'Open player in new tab',
      icon: Play,
      action: () => {
        if (embed) window.open(embed, '_blank', 'noopener')
      },
    },    {
      label: 'Copy stream link',
      icon: Copy,
      action: () => {
        try {
          if (navigator.clipboard) navigator.clipboard.writeText(card.url)
        } catch {
          // ignore clipboard errors
        }
      },
    },
    {
      label: 'Copy player link',
      icon: Link2,
      action: () => {
        try {
          if (navigator.clipboard && embed) navigator.clipboard.writeText(embed)
        } catch {
          // ignore clipboard errors
        }
      },
    },
  ]
}
