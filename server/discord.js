const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let ready = false;
let lastError = '';

function start() {
  if (!config.discordToken) {
    lastError = 'No DISCORD_TOKEN set. Add it to .env to enable notifications.';
    return;
  }
  client.on('ready', () => {
    ready = true;
    lastError = '';
    console.log(`[discord] Logged in as ${client.user.tag} (${client.user.id})`);
  });
  client.on('error', (err) => {
    lastError = err.message;
    console.error('[discord] error:', err.message);
  });
  client.on('rateLimit', (info) => {
    console.warn('[discord] rate limited:', info.timeout, 'ms');
  });
  client.login(config.discordToken).catch((err) => {
    lastError = err.message;
    console.error('[discord] login failed:', err.message);
  });
}

function isReady() {
  return ready && client.isReady();
}

function status() {
  return {
    ready: isReady(),
    configured: Boolean(config.discordToken),
    user: isReady() ? { tag: client.user.tag, id: client.user.id } : null,
    guildCount: isReady() ? client.guilds.cache.size : 0,
    lastError,
  };
}

function listGuilds() {
  if (!isReady()) return [];
  const out = [];
  for (const guild of client.guilds.cache.values()) {
    const channels = guild.channels.cache
      .filter((c) => c.type === 0 || c.type === 5) // text + announcement
      .map((c) => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const roles = guild.roles.cache
      .filter((r) => r.name !== '@everyone' && !r.managed)
      .map((r) => ({ id: r.id, name: r.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    out.push({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 128 }) || '',
      channels,
      roles,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function findChannel(channelId) {
  if (!isReady()) return null;
  return client.channels.cache.get(channelId) || null;
}

async function sendToChannel(channelId, payload, fallbackServerId) {
  if (!isReady()) throw new Error('Discord bot is not connected. Check DISCORD_TOKEN in .env');
  let channel = findChannel(channelId);
  if (!channel && fallbackServerId) {
    const guild = client.guilds.cache.get(fallbackServerId);
    if (guild) channel = guild.channels.cache.get(channelId);
  }
  if (!channel) throw new Error(`Discord channel ${channelId} not found. Re-invite the bot / grant access.`);
  if (!channel.isTextBased()) throw new Error(`Channel #${channel.name} is not a text channel.`);
  return channel.send(payload);
}

module.exports = { start, isReady, status, listGuilds, sendToChannel, client };
