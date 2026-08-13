const { getJson, numberOr, normalizeHandle } = require('./http');

const key = 'kick';
const label = 'Kick';
const color = '#53FC18';
const iconUrl = 'https://kick.com/favicon.ico';

const urlFor = (username) => `https://kick.com/${encodeURIComponent(username)}`;

const isConfigured = () => true;

async function fetchChannelInfo(username) {
  const clean = normalizeHandle(username);
  const data = await getJson(`https://kick.com/api/v2/channels/${encodeURIComponent(clean)}`);
  const user = data.user || {};
  if (!user.username) throw new Error('Kick channel not found');
  return {
    username: user.username,
    displayName: user.display_name || user.username,
    avatar: user.profile_pic || '',
    url: urlFor(user.username),
    followers: numberOr(user.followers_count),
  };
}

async function fetchStatus(username) {
  const clean = normalizeHandle(username);
  const data = await getJson(`https://kick.com/api/v2/channels/${encodeURIComponent(clean)}`);
  const user = data.user || {};
  const live = data.livestream || null;

  const base = {
    username: user.username || clean,
    displayName: user.display_name || user.username || clean,
    avatar: user.profile_pic || '',
    url: urlFor(user.username || clean),
    isLive: Boolean(live && live.id),
    title: live ? live.session_title || 'Untitled stream' : '',
    game: live && live.categories && live.categories[0] ? live.categories[0].name : '',
    viewers: live ? numberOr(live.viewer_count) : 0,
    startedAt: live ? live.created_at || '' : '',
    thumbnail: '',
    latestVideo: null,
  };

  if (live) {
    let thumb = (live.thumbnail && live.thumbnail.url) || '';
    if (thumb) thumb = thumb.replace('{width}', '1280').replace('{height}', '720');
    base.thumbnail = thumb;
  }
  return base;
}

module.exports = { key, label, color, iconUrl, urlFor, isConfigured, fetchChannelInfo, fetchStatus };
