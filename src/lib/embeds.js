function getParent() {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname
  }
  return 'localhost'
}

export function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/(?:embed|v|shorts|live)\/)([\w-]{11})/,
  ]
  for (const p of patterns) {
    const m = String(url).match(p)
    if (m && m[1]) return m[1]
  }
  return null
}

export function buildEmbedUrl(platform, url) {
  if (!url || !url.trim()) return ''
  const input = url.trim()
  try {
    switch (platform) {
      case 'youtube': {
        const id = extractYouTubeId(input)
        return id
          ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
          : ''
      }
      case 'twitch': {
        const parent = getParent()
        if (/(?:twitch\.tv)\/videos\/(\d+)/i.test(input)) {
          const id = input.match(/(?:twitch\.tv)\/videos\/(\d+)/i)[1]
          return `https://player.twitch.tv/?video=${id}&parent=${parent}&autoplay=true`
        }
        const m = input.match(/(?:twitch\.tv)\/([\w]+)/i)
        if (m) {
          return `https://player.twitch.tv/?channel=${m[1]}&parent=${parent}&autoplay=true`
        }
        return input
      }
      case 'kick': {
        const m = input.match(/kick\.com\/([\w-]+)/i)
        return m ? `https://player.kick.com/${m[1]}` : input
      }
      default:
        return input
    }
  } catch {
    return input
  }
}

export function validateUrl(platform, url) {
  const embed = buildEmbedUrl(platform, url)
  return embed !== url || /^https?:\/\//i.test(url.trim())
}
