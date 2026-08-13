# Stream Notifier

A Discord notification bot with a **React** web dashboard that watches **YouTube, Twitch, Kick and TikTok** channels and posts custom embeds when they go live or upload videos.

```
┌────────────┐    REST API     ┌────────────────────────────┐
│ React SPA  │ ──────────────► │  Express + discord.js bot   │
│ (Vite)     │                 │  ─ poller (YouTube/Twitch/  │
└────────────┘                 │    Kick/TikTok)             │
                               │  ─ embed builder            │
                               │  ─ JSON storage             │
                               └────────────┬───────────────┘
                                            │ Discord Gateway
                                            ▼
                                      Discord servers
```

## Features

- **Your Channels** – add your own YouTube / Twitch / Kick / TikTok channels, give them a custom name, choose the Discord server + channel that receives notifications, enable/disable notifications, and send a test notification.
- **Friends' Channels** – add friends' channels, organise them into groups, enable/disable individual channels, see live status at a glance, and optionally mention a role.
- **Custom Embed Builder** – live preview, drag & drop blocks, colour picker, images, buttons and **variables** (`{creator}`, `{username}`, `{platform}`, `{title}`, `{game}`, `{viewers}`, `{url}`, `{thumbnail}`, `{avatar}`, `{started_at}`).
- **Dashboard** – servers, live creators, recent notifications, connected channels, platform status and notification history.

## Requirements

- Node.js **18+** (tested on 24.x)

## 1. Install

```bash
npm run install:all
```

## 2. Configuration

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=3000
DISCORD_TOKEN=            # required for notifications
POLL_INTERVAL=60
TWITCH_CLIENT_ID=         # required for Twitch
TWITCH_CLIENT_SECRET=     # required for Twitch
YOUTUBE_API_KEY=          # optional (RSS fallback works without it)
```

### Discord bot setup

1. Go to https://discord.com/developers/applications → **New Application**.
2. **Bot** tab → **Reset Token** → copy it into `DISCORD_TOKEN`.
3. In the **OAuth2 → URL Generator**, select:
   - Scopes: `bot`
   - Bot permissions: `Send Messages`, `Embed Links`, `Mention Everyone` (if you use role mentions), `Read Messages`
4. Open the generated URL, pick a server and authorize.
5. Restart the server. The dashboard will show **Bot online**.

### Twitch setup (required for Twitch support)

1. https://dev.twitch.tv/console/apps → **Register Your Application** (OAuth redirect URI can be `http://localhost`).
2. Copy **Client ID** and generate a **Client Secret** into the `.env`.

## 3. Run

Development (hot reload + Vite dev server on `http://localhost:5173`):

```bash
npm run dev
```

Production (build the SPA once, server serves it on `http://localhost:3000`):

```bash
npm run start:prod
```

Open the dashboard at **http://localhost:3000**.

## Platform notes

| Platform | Credentials     | Notes |
| -------- | --------------- | ----- |
| Twitch   | Client ID + Secret | Helix API. |
| YouTube  | Optional API key  | Uses the public RSS feed by default. You can enter a channel ID (`UC...`) or a `@handle`. |
| Kick     | none             | Scrapes the public API. Kick uses Cloudflare – works best from a residential IP; datacenter/VPS IPs may be blocked. |
| TikTok   | none             | Best-effort live detection from the public live-room endpoint. |

## How notifications work

The poller checks every `POLL_INTERVAL` seconds (min 15s) whether a tracked channel is:

- **Live** – a notification is sent the first time a new live stream is detected (per stream).
- **New video** – YouTube (RSS), Twitch (archives) and TikTok (when available) send a video notification. Videos are only announced when the channel is not currently live.

Each channel can override the embed template (Embed Builder → pick the channel). Role mentions are prepended to the message.

## API overview

```
GET  /api/health              health check
GET  /api/status              bot + platform + count status
GET  /api/platforms           platform list + configured flags
GET  /api/variables           embed variables
GET  /api/guilds              Discord servers, text channels and roles
GET  /api/data                settings, channels, groups
GET  /api/history             notification history
POST /api/channels            create channel
PUT  /api/channels/:id        update channel (incl. per-channel template)
DELETE /api/channels/:id      delete channel
POST /api/channels/:id/check  refresh live/video status
POST /api/channels/:id/test   send test notification for a channel
POST /api/test                send test from the embed builder
POST /api/platforms/:key/check  validate a username on a platform
GET/POST/DELETE /api/groups   manage friend groups
PUT  /api/settings            poll interval + default template
```

## Storage

All data (channels, groups, templates, history) lives in `data/store.json`. It is created automatically on first run. Stop the server before editing it manually.
