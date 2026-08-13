const { getJson, numberOr, normalizeHandle } = require('./http');

const key = 'tiktok';
const label = 'TikTok';
const color = '#000000';
const iconUrl = 'https://www.tiktok.com/favicon.ico';

const urlFor = (username) => `https://www.tiktok.com/@${encodeURIComponent(username)}`;

const isConfigured = () => true;

const HEADERS = {
  Referer: 'https://www.tiktok.com/',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function liveRoom(username) {
  const clean = normalizeHandle(username);
  const data = await getJson(
    `https://www.tiktok.com/api-live/user/room/?uniqueId=${encodeURIComponent(clean)}`,
    HEADERS
  );
  return data.data || {};
}

async function userInfo(username) {
  const clean = normalizeHandle(username);
  const data = await getJson(
    `https://www.tiktok.com/api/unique/get/?uniqueId=${encodeURIComponent(clean)}`,
    HEADERS
  );
  return data.userInfo || {};
}

async function fetchChannelInfo(username) {
  const clean = normalizeHandle(username);
  const info = await userInfo(clean);
  const user = info.user || {};
  if (!user.uniqueId) throw new Error('TikTok channel not found');
  return {
    username: user.uniqueId,
    displayName: user.nickname || user.uniqueId,
    avatar: user.avatarMedium || user.avatarLarger || user.avatarThumb || '',
    url: urlFor(user.uniqueId),
    followers: numberOr(user.followerCount),
  };
}

async function fetchStatus(username) {
  const clean = normalizeHandle(username);
  let user = {};
  try {
    const info = await userInfo(clean);
    user = info.user || {};
  } catch (e) { /* profile fetch failed - continue */ }

  let room = {};
  try {
    room = await liveRoom(clean);
  } catch (e) { /* live fetch failed - continue */ }

  const live = room.liveRoom || null;
  const status = room.status;

  let avatar = user.avatarMedium || user.avatarLarger || user.avatarThumb || '';
  if (!avatar && live && live.owner) avatar = live.owner.avatarThumb || live.owner.avatarLarger || '';
  const displayName = user.nickname || (live && live.owner ? live.owner.nickname : '') || clean;

  // Best-effort: recent video from the web feed (may be blocked without cookies)
  let latestVideo = null;
  try {
    const feed = await getJson(
      `https://www.tiktok.com/api/post/item_list/?uniqueId=${encodeURIComponent(clean)}&count=1&aid=1988&is_manifest_browser=true&from=detail&_signature=`,
      { ...HEADERS, 'X-Requested-With': 'XMLHttpRequest' }
    );
    const item = feed.itemList && feed.itemList[0];
    if (item) {
      latestVideo = {
        videoId: item.id,
        title: item.desc || '',
        url: `https://www.tiktok.com/@${clean}/video/${item.id}`,
        thumbnail: (item.video && item.video.cover) || (item.video && item.video.originCover) || '',
        publishedAt: item.createTime ? new Date(item.createTime * 1000).toISOString() : '',
      };
    }
  } catch (e) { /* video feed unavailable - ignore */ }

  const thumbFinal =
    live && (live.coverUrl || (live.streamUrl && live.streamUrl.thumbnail_url))
      ? live.coverUrl || live.streamUrl.thumbnail_url
      : '';

  return {
    username: user.uniqueId || clean,
    displayName,
    avatar,
    url: urlFor(user.uniqueId || clean),
    isLive: Boolean(live && live.id),
    title: live ? live.title || '' : '',
    game: live ? (live.topic ? live.topic.name : '') : '',
    viewers: live ? numberOr(live.userCount) : 0,
    startedAt: live ? new Date(Number(live.startTime || 0) * 1000).toISOString() : '',
    thumbnail: thumbFinal,
    latestVideo,
  };
}

module.exports = { key, label, color, iconUrl, urlFor, isConfigured, fetchChannelInfo, fetchStatus };
