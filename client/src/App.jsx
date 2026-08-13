import React, { useCallback, useEffect, useState } from 'react';
import { get, post, put, del, discordInviteUrl } from './api';
import { useToast } from './context.jsx';
import ChannelCard from './components/ChannelCard.jsx';
import ChannelForm from './components/ChannelForm.jsx';
import EmbedBuilder from './components/EmbedBuilder.jsx';
import GroupsManager from './components/GroupsManager.jsx';
import History from './components/History.jsx';
import { Badge, ChannelAvatar } from './components/common.jsx';

const NAV = [
  { group: 'Dashboard', items: [
    { key: 'overview', label: 'Overview', icon: '🏠' },
    { key: 'live', label: 'Live now', icon: '🔴' },
  ] },
  { group: 'Channels', items: [
    { key: 'your', label: 'Your channels', icon: '⭐' },
    { key: 'friends', label: 'Friends', icon: '👥' },
  ] },
  { group: 'Tools', items: [
    { key: 'builder', label: 'Embed builder', icon: '🧩' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'groups', label: 'Channel groups', icon: '🗂' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ] },
];

export default function App() {
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState(null);
  const [status, setStatus] = useState(null);
  const [data, setData] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [variables, setVariables] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [st, dt, gd, pf, vx, hx] = await Promise.all([
      get('/status'), get('/data'), get('/guilds'), get('/platforms'), get('/variables'), get('/history'),
    ]);
    setStatus(st);
    setData(dt);
    setGuilds(gd);
    setPlatforms(pf);
    setVariables(vx);
    setHistory(hx);
  }, []);

  useEffect(() => {
    refresh().catch((e) => console.error(e)).finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const t = setInterval(() => {
      get('/data').then(setData).catch(() => {});
      get('/status').then(setStatus).catch(() => {});
      get('/history').then(setHistory).catch(() => {});
      get('/guilds').then(setGuilds).catch(() => {});
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const your = (data && data.yourChannels) || [];
  const friends = (data && data.friendChannels) || [];
  const groups = (data && data.groups) || [];
  const all = [...your, ...friends];
  const liveChannels = all.filter((c) => c.state && c.state.lastLiveKey);
  const botReady = Boolean(status && status.discord && status.discord.ready);
  const bot = status && status.discord;
  const botId = bot && bot.user ? bot.user.id : null;
  const inviteUrl = botId ? discordInviteUrl(botId) : null;
  const openInvite = () => (inviteUrl ? window.open(inviteUrl, '_blank') : toast('Bot needs to be online first.', 'warn'));

  async function runTest(c) {
    try {
      const res = await post(`/channels/${c.id}/test`);
      if (!res.ok) throw new Error(res.error || 'Failed to send test');
      toast('Test notification sent', 'ok');
      refresh();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  async function refreshChannel(c) {
    try {
      const res = await post(`/channels/${c.id}/check`);
      toast(res.status && res.status.isLive ? 'Channel is live right now!' : 'Channel is offline', res.status && res.status.isLive ? 'ok' : 'info');
      refresh();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  async function toggleEnabled(c, v) {
    try {
      await put(`/channels/${c.id}`, { ...c, notificationsEnabled: v });
      toast(v ? 'Notifications enabled' : 'Notifications disabled', 'ok');
      refresh();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  async function deleteChannel(c) {
    if (!window.confirm(`Delete "${c.customName || c.username}"?`)) return;
    try {
      await del(`/channels/${c.id}`);
      toast('Channel deleted', 'ok');
      refresh();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  const renderChannels = (list) =>
    list.length ? (
      <div className="grid cards">{list.map((c) => (
        <ChannelCard
          key={c.id}
          channel={c}
          onEdit={(ch) => setModal({ type: ch.type, channel: ch })}
          onDelete={deleteChannel}
          onToggleEnabled={toggleEnabled}
          onTest={runTest}
          onRefresh={refreshChannel}
        />
      ))}</div>
    ) : (
      <div className="card empty" style={{ padding: 40 }}>
        <div style={{ fontSize: 26, marginBottom: 8 }}>🎬</div>
        Nothing here yet.{' '}
        <button className="btn primary" onClick={() => setModal({ type: 'your', channel: null })} style={{ marginTop: 10 }}>
          Add your first channel
        </button>
      </div>
    );

  const renderFriends = () => {
    if (!friends.length) {
      return (
        <div className="card empty" style={{ padding: 40 }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>👥</div>
          Track your friends' channels so you never miss a stream.{' '}
          <button className="btn primary" onClick={() => setModal({ type: 'friend', channel: null })} style={{ marginTop: 10 }}>
            Add a friend's channel
          </button>
        </div>
      );
    }
    const sections = [];
    for (const gname of [...groups, ...(friends.some((c) => !c.group || c.group === 'Ungrouped') ? ['Ungrouped'] : [])]) {
      const list = friends.filter((c) => (c.group || 'Ungrouped') === gname);
      if (list.length) sections.push({ gname, list });
    }
    return sections.map((s) => (
      <div key={s.gname} style={{ marginBottom: 24 }}>
        <h3 className="section-title" style={{ marginTop: 0 }}>{s.gname}</h3>
        <div className="grid cards">{s.list.map((c) => (
          <ChannelCard
            key={c.id}
            channel={c}
            onEdit={(ch) => setModal({ type: ch.type, channel: ch })}
            onDelete={deleteChannel}
            onToggleEnabled={toggleEnabled}
            onTest={runTest}
            onRefresh={refreshChannel}
          />
        ))}</div>
      </div>
    ));
  };

  const recentHistory = history.slice(0, 5);

  if (loading) {
    return (
      <div className="app">
        <div className="topbar" style={{ justifyContent: 'center' }}><span className="hint">Loading…</span></div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-icon">🔴</span>
          <span className="topbar-title">Stream Notifier</span>
        </div>
        <div className="topbar-right">
          <a href="/" className="btn ghost small">🌐 Website</a>
          {botReady ? (
            <Badge kind="ok"><span className="dot live" /> Online as {bot.user.tag}</Badge>
          ) : (
            <Badge kind="warn"><span className="dot-warn" /> Bot offline</Badge>
          )}
          <button className="btn primary" onClick={openInvite}>➕ Invite bot to server</button>
        </div>
      </header>

      <div className="shell">
        <nav className="side-nav">
          {NAV.map((section, si) => (
            <React.Fragment key={si}>
              <div className="nav-group-title">{section.group}</div>
              {section.items.map((it) => {
                const live = it.key === 'live' ? liveChannels.length : 0;
                return (
                  <button
                    key={it.key}
                    className={`nav-btn ${tab === it.key ? 'active' : ''}`}
                    onClick={() => setTab(it.key)}
                  >
                    <span className="nav-ico">{it.icon}</span>
                    <span className="nav-label">{it.label}</span>
                    {live > 0 && <span className="live-count">{live} live</span>}
                    {it.key === 'notifications' && history.length > 0 && <span className="live-count">{history.length}</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        <main className="main">
          <div className="content">
            {!data && (
              <div className="error-box">
                Could not reach the API server on <b>/api</b>. Start it first (e.g. <code className="mono">npm run server</code>), then refresh.
              </div>
            )}

            {data && tab === 'overview' && (
              <>
                {!guilds.length && (
                  <div className="invite-hero">
                    <span className="invite-hero-icon">🤖</span>
                    <div className="invite-hero-body">
                      <b>Your bot is online but not in any server yet.</b>
                      <div className="hint">Invite it so notifications can be posted to your Discord servers.</div>
                    </div>
                    <button className="btn primary" onClick={openInvite}>Invite now</button>
                  </div>
                )}
                <div className="grid stats" style={{ marginBottom: 20 }}>
                  <div className={`stat ${botReady ? 'ok' : 'warn'}`}>
                    <div className="label">Discord bot</div>
                    <div className="value">{botReady ? 'Online' : 'Offline'}</div>
                  </div>
                  <div className="stat">
                    <div className="label">Channels tracked</div>
                    <div className="value">{all.length}</div>
                  </div>
                  <div className={`stat ${liveChannels.length ? 'ok' : ''}`}>
                    <div className="label">Live now</div>
                    <div className="value">{liveChannels.length}</div>
                  </div>
                  <div className="stat">
                    <div className="label">Notifications sent</div>
                    <div className="value">{history.filter((h) => h.ok).length}</div>
                  </div>
                </div>

                {liveChannels.length > 0 && (
                  <>
                    <h3 className="section-title">🟢 Live right now</h3>
                    <div className="grid cards" style={{ marginBottom: 24 }}>
                      {liveChannels.map((c) => (
                        <div className="card" key={c.id}>
                          <div className="head" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <ChannelAvatar channel={c} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <b>{c.customName || c.username}</b>
                              <div className="hint">{PLATFORM_LABEL(c.platform)} • {c.state.lastLiveViewers || 0} viewers</div>
                            </div>
                            <button className="btn small primary" onClick={() => runTest(c)}>Send test</button>
                          </div>
                          {c.state.lastLiveTitle && <div className="hint" style={{ marginTop: 8 }}>{c.state.lastLiveTitle}</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <h3 className="section-title">Recent notifications</h3>
                {recentHistory.length ? <History history={recentHistory} /> : <div className="card"><div className="empty">No notifications yet.</div></div>}
              </>
            )}

            {data && tab === 'live' && (
              <>
                <div className="page-title">Live now</div>
                <div className="page-sub">Streamers currently broadcasting across all tracked platforms.</div>
                {renderChannels(liveChannels)}
              </>
            )}

            {data && tab === 'your' && (
              <>
                <div className="page-title">Your channels</div>
                <div className="page-sub">Your own streaming accounts. Updates post to your server.</div>
                <div style={{ marginBottom: 14 }}>
                  <button className="btn primary" onClick={() => setModal({ type: 'your', channel: null })}>＋ Add your channel</button>
                </div>
                {renderChannels(your)}
              </>
            )}

            {data && tab === 'friends' && (
              <>
                <div className="page-title">Friends</div>
                <div className="page-sub">Channels you follow. Group them to stay organized.</div>
                <div style={{ marginBottom: 14 }}>
                  <button className="btn primary" onClick={() => setModal({ type: 'friend', channel: null })}>＋ Add friend's channel</button>
                </div>
                {renderFriends()}
              </>
            )}

            {data && tab === 'builder' && (
              <EmbedBuilder channels={all} defaultTemplate={data.settings.defaultTemplate} variables={variables} guilds={guilds} onSaved={refresh} />
            )}

            {data && tab === 'notifications' && (
              <>
                <div className="page-title">Notifications</div>
                <div className="page-sub">Everything the bot has posted or tried to post.</div>
                <History history={history} />
              </>
            )}

            {data && tab === 'groups' && <GroupsManager groups={groups} onChanged={refresh} />}

            {data && tab === 'settings' && <SettingsPanel data={data} onChanged={refresh} />}
          </div>
        </main>
      </div>

      {modal && (
        <ChannelForm
          initial={modal.channel || undefined}
          type={modal.type}
          guilds={guilds}
          platforms={platforms}
          groups={groups}
          onSaved={refresh}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function PLATFORM_LABEL(platform) {
  const map = { youtube: 'YouTube', twitch: 'Twitch', kick: 'Kick', tiktok: 'TikTok' };
  return map[platform] || platform;
}

function SettingsPanel({ data, onChanged }) {
  const toast = useToast();
  const [interval, setInterval] = useState(data.settings.pollInterval);
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      await put('/settings', { pollInterval: Number(interval) });
      toast('Poll interval saved', 'ok');
      onChanged();
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="card" style={{ maxWidth: 460 }}>
      <div className="page-title">Settings</div>
      <div className="page-sub">Tune how often the bot checks for live streams and videos.</div>
      <div className="field">
        <label>Poll every</label>
        <div className="btn-row">
          <input type="number" min="15" value={interval} onChange={(e) => setInterval(e.target.value)} style={{ width: 90 }} />
          <span className="hint">seconds</span>
          <button className="btn primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
