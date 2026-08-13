const express = require('express');
const path = require('path');
const config = require('./config');
const store = require('./store');
const discord = require('./discord');
const poller = require('./poller');
const api = require('./api');

store.load();
discord.start();
poller.startPoller();

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use('/api', api);

const publicDir = config.publicDir;
if (require('fs').existsSync(path.join(publicDir, 'index.html'))) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.listen(config.port, () => {
  console.log(`[server] Dashboard + API running at http://localhost:${config.port}`);
});
