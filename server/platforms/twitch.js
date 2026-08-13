const { getJson, numberOr, normalizeHandle } = require('./http');
const config = require('../config');

const key = 'twitch';
const label = 'Twitch';
const color = '#9146FF';
const iconUrl = 'https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png';

const urlFor = (username) => `https://www.twitch.tv/${encodeURIComponent(username)}`;

const isConfigured = () => Boolean(config.twitchClientId && config.twitchClientSecret);

const tokenCache = { token: '', expiresAt: 0 };

async function getToken() {
  if (!isConfigured()) throw new Error('Twitch is not configured. Add TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET to .env');
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - 60000) return tokenCache.token;
  const params = new URLSearchParams({
    client_id: config.twitchClientId,
    client_secret: config.twitchClientSecret,
    grant_type: 'client_credentials',
  });
  const res = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: 'POST' });
  const json = await res.json();
  if (!json.access_token) throw new Error('Twitch auth failed: ' + (json.message || 'unknown error'));
  tokenCache.token = json.access_token;
  tokenCache.expiresAt = Date.now() + (json.expires_in || 3600) * 1000;
  return tokenCache.token;
}

async function api(url) {
  const token = await getToken();
  return getJson(url, {
    'Client-Id': config.twitchClientId,
    Authorization: `Bearer ${token}`,
  });
}

async function getUser(login) {
  const clean = normalizeHandle(login);
  const data = await api(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(clean)}`);
  const u = data.data && data.data[0];
  if (!u) throw new Error('Twitch channel not found');
  return u;
}

async function fetchChannelInfo(username) {
  const u = await getUser(username);
  return {
    username: u.login,
    displayName: u.display_name,
    avatar: u.profile_image_url || '',
    url: urlFor(u.login),
    followers: numberOr(u.follower_count),
  };
}

async function fetchStatus(username) {
  const u = await getUser(username);
  const [streams, videos] = await Promise.all([
    api(`https://api.twitch.tv/helix/streams?user_id=${u.id}`),
    api(`https://api.twitch.tv/helix/videos?user_id=${u.id}&type=archive&first=1`),
  ]);
  const stream = streams.data && streams.data[0];
  const video = videos.data && videos.data[0];

  let thumbnail = '';
  if (stream && stream.thumbnail_url) {
    thumbnail = stream.thumbnail_url
      .replace('{width}', '1280')
      .replace('{height}', '720');
  }

  return {
    username: u.login,
    displayName: u.display_name,
    avatar: u.profile_image_url || '',
    url: urlFor(u.login),
    isLive: Boolean(stream),
    title: stream ? stream.title : '',
    game: stream ? stream.game_name : '',
    viewers: stream ? numberOr(stream.viewer_count) : 0,
    startedAt: stream ? stream.started_at : '',
    thumbnail,
    latestVideo: video
      ? {
          videoId: video.id,
          title: video.title,
          url: `https://www.twitch.tv/videos/${video.id}`,
          thumbnail: (video.thumbnail_url || '').replace('%{width}', '640').replace('%{height}', '360'),
          publishedAt: video.published_at || '',
        }
      : null,
  };
}

module.exports = { key, label, color, iconUrl, urlFor, isConfigured, fetchChannelInfo, fetchStatus };
