# StreamNotify

A live stream directory for YouTube, Twitch and Kick. Watch streams with live embeds, browse streamers, apply to be featured, and manage everything from an admin dashboard.

Built with React, Vite, Tailwind CSS v4 and lucide-react. Installable as a mobile app (PWA) with offline support.

## Features

- **Streams** — browse cards for YouTube, Twitch and Kick with search and platform tabs.
- **Watch in-app** — click any card to open a live embed (or use the right-click menu for quick actions).
- **Apply** — streamers can apply to be featured; requests land in the admin inbox.
- **Admin dashboard** — create/edit/delete cards with a live preview, review & approve/reject applications.
- **PWA** — add to home screen on mobile, works offline.

## Development

```bash
npm install
npm run dev        # start dev server (http://localhost:5173)
npm run build      # production build into dist/
npm run lint       # oxlint
```

## Hosting on Vercel

This project is pre-configured for Vercel (`vercel.json` handles the build, output and PWA service-worker headers).

**Option A — Deploy with Git (recommended):**

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. Import it at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Vite.
3. Deploy. Each push to the default branch redeploys automatically.

**Option B — One-click deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/streamnotify)

Replace the `repository-url` with your repo before using the button.

**Option C — Vercel CLI:**

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

The admin login and all data (cards, applications) live in the browser's local storage — use the **Admin** link in the navbar and sign in with the admin credentials to manage the site.
