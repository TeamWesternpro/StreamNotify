export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: 'POST', body });
export const put = (path, body) => api(path, { method: 'PUT', body });
export const del = (path) => api(path, { method: 'DELETE' });

// Send Messages, Embed Links, Read Messages, Mention Everyone,
// Read Message History, Add Reactions, Attach Files, Use External Emoji
export const INVITE_PERMISSIONS = 511040;

export function discordInviteUrl(clientId) {
  return `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&permissions=${INVITE_PERMISSIONS}&scope=bot`;
}

export const PLATFORM_META = {
  youtube: { label: 'YouTube', color: '#FF0000', bg: '#2b0b0b', channel: 'https://www.youtube.com/' },
  twitch: { label: 'Twitch', color: '#9146FF', bg: '#2b1440', channel: 'https://www.twitch.tv/' },
  kick: { label: 'Kick', color: '#53FC18', bg: '#103a08', channel: 'https://kick.com/' },
  tiktok: { label: 'TikTok', color: '#25F4EE', bg: '#111111', channel: 'https://www.tiktok.com/@' },
};

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
