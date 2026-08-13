const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { dataFile } = require('./config');

const DEFAULT_TEMPLATE = () => ({
  color: '#9146FF',
  showWatchButton: true,
  watchButtonLabel: 'Watch Live',
  buttons: [],
  sections: [
    { id: 's-author', kind: 'author', name: '{creator}', icon: '{avatar}' },
    { id: 's-title', kind: 'title', text: '{creator} is live on {platform}!' },
    { id: 's-desc', kind: 'description', text: '{title}' },
    { id: 's-platform', kind: 'platform', label: 'Platform', value: '{platform}' },
    { id: 's-streamtitle', kind: 'streamtitle', label: 'Stream', value: '{title}' },
    { id: 's-game', kind: 'game', label: 'Game', value: '{game}' },
    { id: 's-viewers', kind: 'viewers', label: 'Viewers', value: '{viewers}' },
    { id: 's-started', kind: 'startedat', label: 'Started', value: '{started_at}' },
    { id: 's-thumb', kind: 'thumbnail', value: '{thumbnail}' },
    { id: 's-image', kind: 'image', value: '' },
    { id: 's-footer', kind: 'footer', text: 'Powered by Stream Notifier', icon: '' },
    { id: 's-timestamp', kind: 'timestamp', enabled: true },
  ],
});

function defaults() {
  return {
    settings: {
      pollInterval: 60,
      defaultTemplate: DEFAULT_TEMPLATE(),
    },
    yourChannels: [],
    friendChannels: [],
    groups: [],
    history: [],
  };
}

let data = null;

function ensureFile() {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaults(), null, 2));
  }
}

function load() {
  ensureFile();
  try {
    const raw = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    data = { ...defaults(), ...raw };
  } catch (e) {
    console.error('Could not read store.json, using defaults:', e.message);
    data = defaults();
  }
  return data;
}

function save() {
  ensureFile();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function uid() {
  return crypto.randomUUID();
}

// ---- helpers -----------------------------------------------------------
function allChannels() {
  return [...data.yourChannels, ...data.friendChannels];
}

function findChannel(id) {
  return allChannels().find((c) => c.id === id) || null;
}

function addChannel(channel) {
  channel.id = channel.id || uid();
  channel.createdAt = channel.createdAt || new Date().toISOString();
  if (channel.type === 'friend') {
    data.friendChannels.push(channel);
  } else {
    data.yourChannels.push(channel);
  }
  save();
  return channel;
}

function updateChannel(id, patch) {
  let target = data.yourChannels.find((c) => c.id === id);
  let list = 'yourChannels';
  if (!target) {
    target = data.friendChannels.find((c) => c.id === id);
    list = 'friendChannels';
  }
  if (!target) return null;
  const merged = { ...target, ...patch, id: target.id, createdAt: target.createdAt };
  if (list === 'yourChannels') {
    data.yourChannels = data.yourChannels.map((c) => (c.id === id ? merged : c));
  } else {
    data.friendChannels = data.friendChannels.map((c) => (c.id === id ? merged : c));
  }
  save();
  return merged;
}

function deleteChannel(id) {
  data.yourChannels = data.yourChannels.filter((c) => c.id !== id);
  data.friendChannels = data.friendChannels.filter((c) => c.id !== id);
  save();
}

function addHistory(entry) {
  entry.id = uid();
  entry.time = entry.time || new Date().toISOString();
  data.history.unshift(entry);
  if (data.history.length > 500) data.history = data.history.slice(0, 500);
  save();
  return entry;
}

module.exports = {
  get: () => data,
  load,
  save,
  uid,
  allChannels,
  findChannel,
  addChannel,
  updateChannel,
  deleteChannel,
  addHistory,
  DEFAULT_TEMPLATE,
};
