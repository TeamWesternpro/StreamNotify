require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

module.exports = {
  port: Number(process.env.PORT || 3000),
  discordToken: process.env.DISCORD_TOKEN || '',
  pollInterval: Math.max(15, Number(process.env.POLL_INTERVAL || 60)),
  twitchClientId: process.env.TWITCH_CLIENT_ID || '',
  twitchClientSecret: process.env.TWITCH_CLIENT_SECRET || '',
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  dataFile: require('path').join(__dirname, '..', 'data', 'store.json'),
  publicDir: require('path').join(__dirname, '..', 'client', 'dist'),
};
