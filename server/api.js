const express = require('express');
const store = require('./store');
const discord = require('./discord');
const poller = require('./poller');
const platforms = require('./platforms');
const { templateForChannel } = require('./embed');
const { VARIABLES, sampleData } = require('./variables');
const { normalizeHandle } = require('./platforms/http');

const router = express.Router();

function cleanChannel(body) {
  const allowed = [
    'type', 'platform', 'username', 'customName', 'group',
    'serverId', 'serverName', 'channelId', 'channelName',
    'roleId', 'roleName', 'roleMentionEnabled',
    'notificationsEnabled', 'notifyLive', 'notifyVideo',
    'template',
  ];
  const out = {};
  for (const key of allowed) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  out.platform = String(out.platform || 'twitch').toLowerCase();
  out.username = normalizeHandle(out.username);
  out.customName = String(out.customName || '').trim();
  out.type = out.type === 'friend' ? 'friend' : 'your';
  out.notificationsEnabled = out.notificationsEnabled !== false;
  out.notifyLive = out.notifyLive !== false;
  out.notifyVideo = out.notifyVideo !== false;
  out.roleMentionEnabled = Boolean(out.roleMentionEnabled);
  return out;
}

router.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

router.get('/status', (req, res) => {
  const data = store.get();
  res.json({
    discord: discord.status(),
    pollInterval: data.settings.pollInterval,
    platforms: platforms.list(),
    counts: {
      your: data.yourChannels.length,
      friends: data.friendChannels.length,
      live: store.allChannels().filter((c) => c.state && c.state.lastLiveKey).length,
    },
  });
});

router.get('/platforms', (req, res) => res.json(platforms.list()));

router.get('/variables', (req, res) => res.json(VARIABLES));

router.get('/guilds', (req, res) => res.json(discord.listGuilds()));

router.get('/data', (req, res) => {
  const data = store.get();
  res.json({
    settings: data.settings,
    yourChannels: data.yourChannels,
    friendChannels: data.friendChannels,
    groups: data.groups,
  });
});

router.get('/history', (req, res) => res.json(store.get().history));

// ---- channels ------------------------------------------------------------
router.get('/channels', (req, res) => {
  const type = req.query.type;
  const data = store.get();
  if (type === 'your') return res.json(data.yourChannels);
  if (type === 'friends') return res.json(data.friendChannels);
  res.json(store.allChannels());
});

router.post('/channels', (req, res) => {
  const channel = cleanChannel(req.body || {});
  if (!channel.platform) return res.status(400).json({ error: 'Platform is required' });
  if (!channel.username) return res.status(400).json({ error: 'Username is required' });
  if (channel.type === 'friend' && !channel.group) channel.group = 'Ungrouped';
  const saved = store.addChannel(channel);
  poller.checkChannel(saved, false).catch(() => {});
  res.json(saved);
});

router.put('/channels/:id', (req, res) => {
  const patch = cleanChannel(req.body || {});
  const updated = store.updateChannel(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Channel not found' });
  poller.checkChannel(updated, false).catch(() => {});
  res.json(updated);
});

router.delete('/channels/:id', (req, res) => {
  store.deleteChannel(req.params.id);
  res.json({ ok: true });
});

router.post('/channels/:id/check', async (req, res) => {
  const channel = store.findChannel(req.params.id);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });
  try {
    const result = await poller.checkChannel(channel, false);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/channels/:id/test', async (req, res) => {
  const channel = store.findChannel(req.params.id);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });
  if (!channel.channelId) return res.status(400).json({ error: 'This channel has no Discord destination selected' });
  const status = await platforms.fetchStatus(channel.platform, channel.username).catch(() => sampleData(channel.platform));
  const data = makeData(channel, status);
  const template = templateForChannel(channel, store.get());
  const result = await poller.sendTestNotification({
    channelId: channel.channelId,
    serverId: channel.serverId,
    channelName: channel.channelName,
    serverName: channel.serverName,
    template,
    data,
    platform: channel.platform,
    mention: channel.roleMentionEnabled,
    roleId: channel.roleId,
  });
  res.json(result);
});

function makeData(channel, status) {
  const d = poller.statusToData(channel, status, status && status.isLive ? 'live' : 'video');
  return d;
}

// generic test from the embed builder
router.post('/test', async (req, res) => {
  const body = req.body || {};
  const template = body.template;
  if (!template) return res.status(400).json({ error: 'Template is required' });
  if (!body.channelId) return res.status(400).json({ error: 'Select a Discord channel first' });
  const data = body.data || sampleData(body.platform || 'twitch');
  const result = await poller.sendTestNotification({
    channelId: body.channelId,
    serverId: body.serverId,
    channelName: body.channelName,
    serverName: body.serverName,
    template,
    data,
    platform: body.platform,
    mention: body.mention,
    roleId: body.roleId,
  });
  res.json(result);
});

router.post('/platforms/:key/check', async (req, res) => {
  const { key } = req.params;
  const platform = platforms.get(key);
  if (!platform) return res.status(400).json({ error: 'Unknown platform' });
  const username = String(req.body.username || '').trim();
  if (!username) return res.status(400).json({ error: 'Username is required' });
  try {
    const info = await platform.fetchChannelInfo(username);
    res.json({ ok: true, ...info, platform: key });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ---- groups --------------------------------------------------------------
router.get('/groups', (req, res) => res.json(store.get().groups));

router.post('/groups', (req, res) => {
  const name = String((req.body && req.body.name) || '').trim();
  if (!name) return res.status(400).json({ error: 'Group name is required' });
  const groups = store.get().groups;
  if (!groups.includes(name)) groups.push(name);
  store.save();
  res.json(groups);
});

router.delete('/groups/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const data = store.get();
  data.groups = data.groups.filter((g) => g !== name);
  for (const c of data.friendChannels) {
    if (c.group === name) c.group = 'Ungrouped';
  }
  store.save();
  res.json({ ok: true });
});

// ---- settings ------------------------------------------------------------
router.put('/settings', (req, res) => {
  const body = req.body || {};
  const data = store.get();
  if (body.pollInterval) {
    data.settings.pollInterval = Math.max(15, Number(body.pollInterval));
  }
  if (body.defaultTemplate && body.defaultTemplate.sections) {
    data.settings.defaultTemplate = body.defaultTemplate;
  }
  store.save();
  poller.stopPoller();
  poller.startPoller();
  res.json(data.settings);
});

module.exports = router;
