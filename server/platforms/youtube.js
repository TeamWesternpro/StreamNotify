const { getJson, getText, normalizeHandle } = require('./http');
const config = require('../config');

const key = 'youtube';
const label = 'YouTube';
const color = '#FF0000';
const iconUrl = 'https://www.youtube.com/favicon.ico';

const urlFor = (username) => `https://www.youtube.com/${encodeURIComponent(username)}`;

const isConfigured = () => Boolean(config.youtubeApiKey);

const CHANNEL_ID_RE = /^UC[\w-]{22}$/;

async function getChannelId(username) {
  const clean = normalizeHandle(username);
  if (CHANNEL_ID_RE.test(clean)) return clean;
  const html = await getText(`https://www.youtube.com/@${encodeURIComponent(clean)}`);
  const id =
    html.match(/"channelId":"(UC[\w-]{22})"/) ||
    html.match(/"externalId":"(UC[\w-]{22})"/) ||
    html.match(/"browseId":"(UC[\w-]{22})"/);
  if (!id) throw new Error('YouTube channel not found (try using the channel ID)');
  return id[1];
}

function extractInitialData(html) {
  const m = html.match(/ytInitialData = (\{.*?\});\s*<\/script>/s) || html.match(/window\["ytInitialData"\] = (\{.*?\});\s*<\/script>/s);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (e) {
    return null;
  }
}

function findLiveVideo(node) {
  if (!node || typeof node !== 'object') return null;
  if (
    node.videoRenderer &&
    node.videoRenderer.videoId &&
    node.videoRenderer.isLive !== undefined
  ) {
    const vr = node.videoRenderer;
    if (vr.isLive) {
      const badges = JSON.stringify(vr.badges || '');
      return {
        videoId: vr.videoId,
        title: (vr.title && vr.title.runs && vr.title.runs.map((r) => r.text).join('')) || '',
        isLive: vr.isLive,
        isUpcoming: badges.includes('UPCOMING') && !vr.isLive,
        viewers: vr.liveViewCountText ? vr.liveViewCountText.simpleText || '' : '',
      };
    }
  }
  for (const k of Object.keys(node)) {
    const found = findLiveVideo(node[k]);
    if (found) return found;
  }
  return null;
}

async function parseRss(channelId) {
  const xml = await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  const entries = [];
  const blockRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = blockRe.exec(xml))) {
    const block = m[1];
    const videoId = (block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
    const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    const published = (block.match(/<published>([^<]+)<\/published>/) || [])[1];
    const thumb = (block.match(/media:thumbnail[^>]*url="([^"]+)"/) || [])[1];
    const author = (block.match(/<name>([^<]+)<\/name>/) || [])[1];
    if (videoId) {
      entries.push({
        videoId,
        title: (title || '').trim(),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: thumb || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        publishedAt: published || '',
        author: author || '',
      });
    }
  }
  return entries;
}

async function channelMeta(channelId) {
  const html = await getText(`https://www.youtube.com/channel/${channelId}/about`);
  const data = extractInitialData(html);
  const meta = data && data.metadata && data.metadata.channelMetadataRenderer;
  if (meta) {
    const thumbs = (meta.avatar && meta.avatar.thumbnails) || [];
    const avatar = thumbs.length ? thumbs[thumbs.length - 1].url.split('?')[0] : '';
    return { title: meta.title || '', avatar, externalId: meta.externalId || channelId };
  }
  return { title: '', avatar: '', externalId: channelId };
}

async function fetchChannelInfo(username) {
  const channelId = await getChannelId(username);
  const meta = await channelMeta(channelId);
  return {
    username: meta.externalId || channelId,
    displayName: meta.title || username,
    avatar: meta.avatar || '',
    url: urlFor(meta.externalId || channelId),
    followers: 0,
  };
}

async function fetchStatus(username) {
  const channelId = await getChannelId(username);
  const meta = await channelMeta(channelId);
  const entries = await parseRss(channelId);

  let live = null;
  try {
    const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: { 'User-Agent': require('./http').UA },
      redirect: 'follow',
    });
    const html = await res.text();
    const videoPage = res.url.includes('/watch?v=');
    if (videoPage) {
      const m = html.match(/ytInitialPlayerResponse = (\{.*?\});\s*<\/script>/s);
      if (m) {
        try {
          const pr = JSON.parse(m[1]);
          const vd = pr && pr.videoDetails;
          const lb = pr && pr.microformat && pr.microformat.playerMicroformatRenderer && pr.microformat.playerMicroformatRenderer.liveBroadcastDetails;
          if (vd && (vd.isLive || (lb && lb.isLiveNow))) {
            live = {
              videoId: vd.videoId,
              title: vd.title || '',
              startedAt: (lb && lb.startTimestamp) || '',
              viewers: lb && lb.endTimestamp ? 0 : 0,
            };
          }
        } catch (e) { /* ignore */ }
      }
    }
    if (!live && !videoPage) {
      const data = extractInitialData(html);
      if (data) {
        const found = findLiveVideo(data);
        if (found && found.isLive) {
          live = { videoId: found.videoId, title: found.title, startedAt: '', viewers: 0 };
        }
      }
    }
  } catch (e) {
    /* live check failed - ignore */
  }

  const latest = entries[0] || null;
  return {
    username: meta.externalId || channelId,
    displayName: meta.title || username,
    avatar: meta.avatar || '',
    url: urlFor(meta.externalId || channelId),
    isLive: Boolean(live),
    title: live ? live.title : '',
    game: live ? 'Live' : '',
    viewers: 0,
    startedAt: live ? live.startedAt : '',
    thumbnail: live ? `https://i.ytimg.com/vi/${live.videoId}/maxresdefault.jpg` : (latest ? latest.thumbnail : ''),
    latestVideo: latest,
  };
}

module.exports = { key, label, color, iconUrl, urlFor, isConfigured, fetchChannelInfo, fetchStatus };
