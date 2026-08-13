import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, discordInviteUrl } from '../api';

const PLATFORMS = [
  { key: 'youtube', label: 'YouTube', color: '#FF0000', icon: '🎬' },
  { key: 'twitch', label: 'Twitch', color: '#9146FF', icon: '🎮' },
  { key: 'kick', label: 'Kick', color: '#53FC18', icon: '⚡' },
  { key: 'tiktok', label: 'TikTok', color: '#25F4EE', icon: '🎵' },
];

const FEATURES = [
  { icon: '⚡', title: 'Instant live alerts', text: 'The moment a streamer goes live, a formatted embed lands in your Discord channel — no manual checking.' },
  { icon: '🧩', title: 'Custom embed builder', text: 'Drag, drop and style embeds with your own colors, fields and live video thumbnails. No code needed.' },
  { icon: '🗂', title: 'Groups & organization', text: 'Group friend channels however you like. Each one notifies to its own server and text channel.' },
  { icon: '🔔', title: 'Role mentions', text: 'Ping the right people. Mention a specific Discord role so your community never misses a drop.' },
  { icon: '📺', title: 'Multi-platform', text: 'YouTube, Twitch, Kick and TikTok in one place. One bot, one dashboard, every streamer.' },
  { icon: '🔒', title: 'Self-hosted & private', text: 'Runs on your own machine with your own bot token. Your data never leaves your network.' },
];

const STEPS = [
  { n: '01', title: 'Invite the bot', text: 'Click a button and authorize the bot in your Discord server in seconds.' },
  { n: '02', title: 'Add channels', text: 'Paste any YouTube, Twitch, Kick or TikTok handle and pick a destination channel.' },
  { n: '03', title: 'Never miss a stream', text: 'The bot polls constantly and posts a polished embed the instant someone goes live.' },
];

export default function Landing() {
  const [bot, setBot] = useState(null);

  useEffect(() => {
    get('/status')
      .then((s) => s && s.discord && setBot(s.discord))
      .catch(() => {});
  }, []);

  const inviteUrl = bot && bot.user ? discordInviteUrl(bot.user.id) : null;
  const addBot = () => {
    if (inviteUrl) window.open(inviteUrl, '_blank');
    else window.location.href = '/dashboard';
  };

  return (
    <div className="site">
      <nav className="site-nav">
        <Link to="/" className="site-logo">
          <span className="logo-dot">🔴</span>
          <span className="logo-name">Stream&nbsp;Notifier</span>
        </Link>
        <div className="site-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#platforms">Platforms</a>
        </div>
        <div className="site-nav-cta">
          <Link to="/dashboard" className="btn ghost small">Open dashboard</Link>
          <button className="btn primary small" onClick={addBot}>
            Add to Discord
          </button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-grid" />
        <div className="hero-inner">
          <span className="hero-badge">
            <span className="dot-live" /> Discord bot · YouTube · Twitch · Kick · TikTok
          </span>
          <h1 className="hero-title">
            Never miss a <span className="grad">stream</span> again.
          </h1>
          <p className="hero-sub">
            Stream Notifier watches your favorite creators and posts a beautiful, styled
            notification to your Discord the second they go live.
          </p>
          <div className="hero-cta">
            <button className="btn primary lg" onClick={addBot}>
              {inviteUrl ? 'Add to Discord — it’s free' : 'Open dashboard'}
            </button>
            <a href="#how" className="btn lg outline">See how it works</a>
          </div>
          <div className="hero-stats">
            <div><b>4</b><span>platforms</span></div>
            <div><b>0&nbsp;s</b><span>latency alerts</span></div>
            <div><b>100%</b><span>customizable</span></div>
          </div>
        </div>

        <div className="mockup-wrap">
          <div className="mockup">
            <div className="mock-head">
              <span className="dot-live" />
              <b># stream-alerts</b>
              <span className="mock-time">now</span>
            </div>
            <div className="mock-msg">
              <div className="mock-avatar">🎥</div>
              <div className="mock-body">
                <div className="mock-author">Stream Notifier <span className="bot-tag">BOT</span> <span className="mock-time">today at 8:41 PM</span></div>
                <div className="mock-card">
                  <div className="mock-color" />
                  <div className="mock-card-body">
                    <div className="mock-card-title">Twitch</div>
                    <div className="mock-card-big">MrBeast is live on Twitch!</div>
                    <div className="mock-card-text">Insane new challenge — 10,000 subscribers in 24 hours…</div>
                    <div className="mock-fields">
                      <div><span>Viewers</span><b>248,012</b></div>
                      <div><span>Game</span><b>Just Chatting</b></div>
                    </div>
                    <div className="mock-btn">Watch Live ↗</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="platforms-strip" id="platforms">
        {PLATFORMS.map((p) => (
          <div className="pchip" key={p.key}>
            <span className="pchip-icon" style={{ background: `${p.color}1f` }}>{p.icon}</span>
            <span>{p.label}</span>
          </div>
        ))}
      </section>

      <section className="section" id="features">
        <div className="section-head">
          <span className="section-kicker">Features</span>
          <h2>Everything you need to keep your community in the loop</h2>
          <p>Purpose-built for streamers and streamer communities. Simple to set up, impossible to ignore.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="how">
        <div className="section-head">
          <span className="section-kicker">How it works</span>
          <h2>Live in under two minutes</h2>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <div className="step-n">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <h2>Ready to level up your server?</h2>
        <p>Invite Stream Notifier and get notified the second your favorite creators go live.</p>
        <button className="btn primary lg" onClick={addBot}>
          {inviteUrl ? 'Add to Discord' : 'Open dashboard'}
        </button>
      </section>

      <footer className="site-footer">
        <div className="footer-top">
          <Link to="/" className="site-logo">
            <span className="logo-dot">🔴</span>
            <span className="logo-name">Stream&nbsp;Notifier</span>
          </Link>
          <div className="footer-links">
            <Link to="/dashboard">Dashboard</Link>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#platforms">Platforms</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Built for streamers, by streamers.</span>
          <span>© {new Date().getFullYear()} Stream Notifier</span>
        </div>
      </footer>
    </div>
  );
}
