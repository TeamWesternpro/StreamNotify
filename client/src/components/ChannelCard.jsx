import React from 'react';
import { PLATFORM_META, timeAgo } from '../api';
import { Badge, LiveBadge, PlatformTag, Toggle, ChannelAvatar } from './common.jsx';

export default function ChannelCard({ channel, onEdit, onDelete, onToggleEnabled, onTest, onRefresh }) {
  const st = channel.state || {};
  const err = st.lastError;
  return (
    <div className="channel-card">
      <div className="head">
        <ChannelAvatar channel={channel} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {channel.customName || channel.username}
            <PlatformTag platform={channel.platform} />
          </div>
          <div className="handle">@{channel.username}</div>
        </div>
        <LiveBadge channel={channel} />
      </div>

      <div className="meta">
        {st.lastLiveKey && st.lastLiveTitle && (
          <div className="row">
            <span className="dot live" />
            <b style={{ color: 'var(--green)' }}>{st.lastLiveTitle}</b>
            {st.lastLiveViewers > 0 && <span>• {st.lastLiveViewers} viewers</span>}
          </div>
        )}
        {st.lastVideoTitle && (
          <div className="row">
            <span style={{ color: 'var(--muted)' }}>▶</span>
            <span className="trunc">{st.lastVideoTitle}</span>
          </div>
        )}
        <div className="row">
          <span>Last check:</span>
          <span>{st.lastCheck ? timeAgo(st.lastCheck) : 'never'}</span>
        </div>
        <div className="row">
          <span>Posts to:</span>
          <span>#{channel.channelName || '—'} {channel.serverName ? `(${channel.serverName})` : ''}</span>
        </div>
        {err && <div className="err">⚠ {err}</div>}
      </div>

      <div className="actions">
        <button className="btn small primary" onClick={() => onTest(channel)} disabled={!channel.channelId}>
          Send test
        </button>
        <button className="btn small" onClick={() => onRefresh(channel)}>Refresh</button>
        <button className="btn small" onClick={() => onEdit(channel)}>Edit</button>
        <button className="btn small danger" onClick={() => onDelete(channel)}>Delete</button>
      </div>
      <Toggle
        checked={channel.notificationsEnabled !== false}
        onChange={(v) => onToggleEnabled(channel, v)}
        label={channel.notificationsEnabled === false ? 'Notifications off' : 'Notifications on'}
      />
    </div>
  );
}
