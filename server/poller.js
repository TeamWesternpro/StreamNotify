const store = require('./store');
const discord = require('./discord');
const platforms = require('./platforms');
const { buildPayload, templateForChannel } = require('./embed');
const { substitute, sampleData } = require('./variables');

const PLATFORM_LABELS = { youtube: 'YouTube', twitch: 'Twitch', kick: 'Kick', tiktok: 'TikTok' };

function statusToData(channel, status, type) {
  const platformLabel = PLATFORM_LABELS[channel.platform] || channel.platform;
  const base = {
    creator: channel.customName || status.displayName || status.username,
    username: status.username || channel.username,
    platform: platformLabel,
    url: status.url || '',
    thumbnail: status.thumbnail || '',
    avatar: status.avatar || '',
  };
  if (type === 'video' && status.latestVideo) {
    const v = status.latestVideo;
    return {
      ...base,
      title: v.title || '',
      game: '',
      viewers: 0,
      started_at: v.publishedAt || '',
      startedAt: v.publishedAt || '',
      isLive: false,
    };
  }
  return {
    ...base,
    title: status.title || '',
    game: status.game || '',
    viewers: String(status.viewers || 0),
    started_at: status.startedAt || '',
    startedAt: status.startedAt || '',
    isLive: Boolean(status.isLive),
  };
}

function mentionPrefix(channel) {
  if (channel.roleMentionEnabled && channel.roleId) {
    return `<@&${channel.roleId}> `;
  }
  return '';
}

async function sendNotification(channel, type, status) {
  const data = statusToData(channel, status, type);
  const template = templateForChannel(channel, store.get());
  const payload = buildPayload(template, data);
  const content = mentionPrefix(channel);

  try {
    await discord.sendToChannel(channel.channelId, payload, channel.serverId);
    store.addHistory({
      type,
      ok: true,
      channelId: channel.id,
      channelName: channel.customName || channel.username,
      platform: channel.platform,
      title: data.title || `${type} notification`,
      url: data.url,
      thumbnail: data.thumbnail,
      sentTo: [channel.channelName, channel.serverName].filter(Boolean).join(' • '),
      live: Boolean(status.isLive),
    });
    return { ok: true, data };
  } catch (err) {
    store.addHistory({
      type,
      ok: false,
      channelId: channel.id,
      channelName: channel.customName || channel.username,
      platform: channel.platform,
      title: data.title || `${type} notification`,
      url: data.url,
      sentTo: [channel.channelName, channel.serverName].filter(Boolean).join(' • '),
      error: err.message,
      live: Boolean(status.isLive),
    });
    return { ok: false, error: err.message };
  }
}

async function checkChannel(channel, notify = false) {
  const platform = platforms.get(channel.platform);
  if (!platform) throw new Error(`Unknown platform ${channel.platform}`);
  const status = await platform.fetchStatus(channel.username);
  const state = channel.state || {};
  const results = [];

  state.lastAvatar = status.avatar || state.lastAvatar;
  if (status.latestVideo && status.latestVideo.videoId) {
    state.lastVideoTitle = status.latestVideo.title || state.lastVideoTitle;
    state.lastVideoUrl = status.latestVideo.url || state.lastVideoUrl;
    state.lastVideoThumb = status.latestVideo.thumbnail || state.lastVideoThumb;
  }

  if (status.isLive) {
    const nowKey = status.title + '|' + (status.startedAt || status.url);
    if (state.lastLiveKey !== nowKey) {
      state.lastLiveKey = nowKey;
      state.lastLiveTitle = status.title;
      state.lastLiveUrl = status.url;
      state.lastLiveViewers = status.viewers;
      if (notify && channel.notificationsEnabled) {
        results.push(await sendNotification(channel, 'live', status));
      }
    } else {
      state.lastLiveViewers = status.viewers;
    }
  }

  if (status.latestVideo && status.latestVideo.videoId && state.lastVideoId !== status.latestVideo.videoId) {
    state.lastVideoId = status.latestVideo.videoId;
    if (notify && channel.notificationsEnabled && !status.isLive) {
      results.push(await sendNotification(channel, 'video', status));
    }
  }

  if (!status.isLive) state.lastLiveKey = '';
  state.lastCheck = new Date().toISOString();
  state.lastError = '';
  channel.state = state;
  store.save();
  return { status, state, results };
}

async function pollOnce() {
  const data = store.get();
  const channels = store.allChannels().filter((c) => c.notificationsEnabled);
  for (const channel of channels) {
    try {
      await checkChannel(channel, true);
    } catch (err) {
      channel.state = channel.state || {};
      channel.state.lastError = err.message;
      channel.state.lastCheck = new Date().toISOString();
      store.save();
      console.warn(`[poller] ${channel.platform}/${channel.username}: ${err.message}`);
    }
  }
}

let timer = null;
function startPoller() {
  stopPoller();
  const data = store.get();
  const intervalMs = Math.max(15, Number(data.settings.pollInterval || 60)) * 1000;
  timer = setInterval(pollOnce, intervalMs);
  console.log(`[poller] started, checking every ${intervalMs / 1000}s`);
  setTimeout(pollOnce, 3000);
}

function stopPoller() {
  if (timer) clearInterval(timer);
  timer = null;
}

async function sendTestNotification(target) {
  const data = store.get();
  const template = target.template || data.settings.defaultTemplate;
  const sample = target.data || sampleData(target.platform || 'twitch');
  const payload = buildPayload(template, sample);
  const content = target.mention ? `<@&${target.roleId}> ` : '';
  try {
    await discord.sendToChannel(target.channelId, payload, target.serverId);
    store.addHistory({
      type: 'test',
      ok: true,
      channelId: target.channelId,
      channelName: target.channelName || '',
      platform: target.platform || '',
      title: 'Test notification',
      sentTo: [target.channelName, target.serverName].filter(Boolean).join(' • '),
    });
    return { ok: true };
  } catch (err) {
    store.addHistory({
      type: 'test',
      ok: false,
      channelId: target.channelId,
      channelName: target.channelName || '',
      platform: target.platform || '',
      title: 'Test notification',
      error: err.message,
      sentTo: [target.channelName, target.serverName].filter(Boolean).join(' • '),
    });
    return { ok: false, error: err.message };
  }
}

module.exports = { startPoller, stopPoller, pollOnce, checkChannel, sendNotification, sendTestNotification, statusToData };
