const VARIABLES = [
  { name: 'creator', label: 'Creator name', example: 'Chipfinity' },
  { name: 'username', label: 'Username / handle', example: 'chipfinity' },
  { name: 'platform', label: 'Platform', example: 'Twitch' },
  { name: 'title', label: 'Stream / video title', example: 'Ranked grind with the squad!' },
  { name: 'game', label: 'Game / category', example: 'Valorant' },
  { name: 'viewers', label: 'Live viewers', example: '1234' },
  { name: 'url', label: 'Watch URL', example: 'https://twitch.tv/chipfinity' },
  { name: 'thumbnail', label: 'Thumbnail image URL', example: 'https://i.imgur.com/abc.jpg' },
  { name: 'avatar', label: 'Channel avatar URL', example: 'https://i.imgur.com/xyz.png' },
  { name: 'started_at', label: 'Started at (ISO date)', example: '2026-08-13T20:15:00Z' },
];

const TOKEN_RE = /\{(creator|username|platform|title|game|viewers|url|thumbnail|avatar|started_at)\}/g;

function substitute(text, data) {
  if (text == null) return text;
  return String(text).replace(TOKEN_RE, (_, key) => {
    const value = data[key];
    return value == null ? '' : String(value);
  });
}

function sampleData(platformKey) {
  const platform = {
    youtube: { name: 'YouTube', user: 'MrBeast', url: 'https://youtube.com/@mrbeast', color: '#FF0000' },
    twitch: { name: 'Twitch', user: 'shroud', url: 'https://twitch.tv/shroud', color: '#9146FF' },
    kick: { name: 'Kick', user: 'Trainwreckstv', url: 'https://kick.com/trainwreckstv', color: '#53FC18' },
    tiktok: { name: 'TikTok', user: 'khaby.lame', url: 'https://tiktok.com/@khaby.lame', color: '#000000' },
  }[platformKey] || { name: 'Twitch', user: 'shroud', url: 'https://twitch.tv/shroud', color: '#9146FF' };

  return {
    creator: platform.name === 'YouTube' ? 'SomeCreator' : 'Chipfinity',
    username: platform.user,
    platform: platform.name,
    title: 'Ranked grind with the squad! We are finally back live',
    game: 'Valorant',
    viewers: '1234',
    url: platform.url,
    thumbnail: 'https://picsum.photos/seed/streamer-notify/640/360',
    avatar: 'https://picsum.photos/seed/streamer-avatar/128/128',
    started_at: '2026-08-13T20:15:00Z',
    isLive: true,
  };
}

module.exports = { VARIABLES, TOKEN_RE, substitute, sampleData };
