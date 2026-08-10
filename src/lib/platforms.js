export const PLATFORMS = {
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    gradient: ['#7f1d1d', '#ff0000'],
    iconPath:
      "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z",
  },
  twitch: {
    label: 'Twitch',
    color: '#9146FF',
    gradient: ['#3b0764', '#9146FF'],
    iconPath:
      'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z',
  },
  kick: {
    label: 'Kick',
    color: '#53FC18',
    gradient: ['#14532d', '#53FC18'],
    iconPath:
      'M1.333 0h21.333C23.403 0 24 .597 24 1.333v21.333c0 .736-.597 1.333-1.333 1.333H1.333C.597 24 0 23.403 0 22.667V1.333C0 .597.597 0 1.333 0zm11.541 5.333c-.368 0-.667.299-.667.667v5.333l-4-5.333H5.453c-.276 0-.52.09-.697.267-.2.2-.313.472-.313.757v10.666c0 .294.238.533.533.533h1.067c.294 0 .533-.239.533-.533V9.653l4 5.36c.155.267.443.32.667.32h2.667c.368 0 .667-.299.667-.667V6c0-.368-.299-.667-.667-.667z',
  },
}

export const PLATFORM_KEYS = Object.keys(PLATFORMS)

export const PLATFORM_HINTS = {
  youtube:
    'Paste a YouTube video link, e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ',
  twitch:
    'Paste a Twitch channel or VOD link, e.g. https://www.twitch.tv/caseoh or https://www.twitch.tv/videos/1234567890',
  kick: 'Paste a Kick channel link, e.g. https://kick.com/xqc',
}

export function platformGradient(platform) {
  const p = PLATFORMS[platform] || PLATFORMS.youtube
  return `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})`
}

export function svgPlaceholder(label, from, to) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs><rect width='640' height='360' fill='url(#g)'/><text x='50%' y='50%' font-family='Arial,sans-serif' font-size='44' font-weight='bold' fill='rgba(255,255,255,0.85)' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}
