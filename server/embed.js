const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { substitute } = require('./variables');

const KIND_META = {
  author: { label: 'Author', icon: '👤', group: 'Header' },
  title: { label: 'Title', icon: '🅣', group: 'Header' },
  description: { label: 'Description', icon: '📝', group: 'Body' },
  platform: { label: 'Platform', icon: '📺', group: 'Fields' },
  streamtitle: { label: 'Stream title', icon: '🎬', group: 'Fields' },
  game: { label: 'Game / category', icon: '🎮', group: 'Fields' },
  viewers: { label: 'Viewers', icon: '👀', group: 'Fields' },
  startedat: { label: 'Started at', icon: '🕒', group: 'Fields' },
  field: { label: 'Custom field', icon: '➕', group: 'Fields' },
  thumbnail: { label: 'Thumbnail', icon: '🖼️', group: 'Media' },
  image: { label: 'Large image', icon: '🌆', group: 'Media' },
  footer: { label: 'Footer', icon: '🦶', group: 'Footer' },
  timestamp: { label: 'Timestamp', icon: '⏰', group: 'Footer' },
};

function buildEmbed(template, data) {
  const embed = new EmbedBuilder();
  const color = String(template.color || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(color)) embed.setColor(color);

  for (const sec of template.sections || []) {
    switch (sec.kind) {
      case 'title': {
        const text = substitute(sec.text, data);
        if (text) embed.setTitle(text);
        break;
      }
      case 'description': {
        const text = substitute(sec.text, data);
        if (text) embed.setDescription(text);
        break;
      }
      case 'author': {
        const name = substitute(sec.name, data);
        const icon = substitute(sec.icon, data);
        if (name) {
          const author = { name };
          if (icon) author.iconURL = icon;
          if (data.url) author.url = data.url;
          embed.setAuthor(author);
        }
        break;
      }
      case 'thumbnail': {
        const value = substitute(sec.value, data);
        if (value) embed.setThumbnail(value);
        break;
      }
      case 'image': {
        const value = substitute(sec.value, data);
        if (value) embed.setImage(value);
        break;
      }
      case 'footer': {
        const text = substitute(sec.text, data);
        const icon = substitute(sec.icon, data);
        if (text) {
          const footer = { text };
          if (icon) footer.iconURL = icon;
          embed.setFooter(footer);
        }
        break;
      }
      case 'timestamp': {
        if (sec.enabled) {
          const ts = data.startedAt || data.started_at;
          embed.setTimestamp(ts && !isNaN(new Date(ts)) ? new Date(ts) : new Date());
        }
        break;
      }
      case 'platform':
      case 'streamtitle':
      case 'game':
      case 'viewers':
      case 'startedat':
      case 'field': {
        const name = substitute(sec.label, data);
        const value = substitute(sec.value, data);
        if (name && value) embed.addFields({ name, value, inline: sec.inline !== false });
        break;
      }
    }
  }
  return embed;
}

function buildComponents(template, data) {
  const buttons = [];
  const watchLabel = substitute(template.watchButtonLabel || 'Watch Live', data);
  const watchUrl = substitute(template.watchButtonUrl || '{url}', data);
  if (template.showWatchButton && watchUrl) {
    buttons.push(new ButtonBuilder().setLabel(watchLabel).setStyle(ButtonStyle.Link).setURL(watchUrl));
  }
  for (const b of template.buttons || []) {
    const label = substitute(b.label, data);
    const url = substitute(b.url, data);
    if (label && url) {
      buttons.push(new ButtonBuilder().setLabel(label).setStyle(ButtonStyle.Link).setURL(url));
    }
  }
  const rows = [];
  while (buttons.length) {
    rows.push(new ActionRowBuilder().addComponents(buttons.splice(0, 5)));
  }
  return rows;
}

function buildPayload(template, data) {
  const payload = { embeds: [buildEmbed(template, data)] };
  const components = buildComponents(template, data);
  if (components.length) payload.components = components;
  return payload;
}

function templateForChannel(channel, store) {
  const templates = channel.template && channel.template.sections ? [channel.template] : [];
  const chosen = templates[0] || (store.settings && store.settings.defaultTemplate) || {};
  return chosen;
}

module.exports = { KIND_META, buildEmbed, buildComponents, buildPayload, templateForChannel };
