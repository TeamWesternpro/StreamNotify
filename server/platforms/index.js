const youtube = require('./youtube');
const twitch = require('./twitch');
const kick = require('./kick');
const tiktok = require('./tiktok');

const platforms = { youtube, twitch, kick, tiktok };

module.exports = {
  platforms,
  list() {
    return Object.values(platforms).map((p) => ({
      key: p.key,
      label: p.label,
      color: p.color,
      iconUrl: p.iconUrl,
      configured: p.isConfigured(),
      urlFor: p.urlFor,
    }));
  },
  get(key) {
    return platforms[key] || null;
  },
  async fetchStatus(platform, username) {
    const p = platforms[platform];
    if (!p) throw new Error(`Unknown platform: ${platform}`);
    return p.fetchStatus(username);
  },
  async fetchChannelInfo(platform, username) {
    const p = platforms[platform];
    if (!p) throw new Error(`Unknown platform: ${platform}`);
    return p.fetchChannelInfo(username);
  },
};
