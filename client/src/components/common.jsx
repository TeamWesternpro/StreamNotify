import React from 'react';
import { PLATFORM_META } from '../api';

export function PlatformTag({ platform }) {
  const meta = PLATFORM_META[platform] || { label: platform, color: '#888' };
  return (
    <span className="platform-tag" style={{ color: meta.color, border: `1px solid ${meta.color}44`, background: `${meta.color}18` }}>
      {meta.label}
    </span>
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label className={`toggle ${disabled ? '' : ''}`} style={{ opacity: disabled ? 0.5 : 1 }}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" />
      <span>{label}</span>
    </label>
  );
}

export function Modal({ title, onClose, children, width }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" style={width ? { width } : undefined} onMouseDown={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function Badge({ kind, children }) {
  return <span className={`badge ${kind}`}>{children}</span>;
}

export function LiveBadge({ channel }) {
  const isLive = channel && channel.state && channel.state.lastLiveKey;
  return (
    <Badge kind={isLive ? 'live' : 'offline'}>
      <span className={`dot ${isLive ? 'live' : 'offline'}`} />
      {isLive ? 'LIVE' : 'Offline'}
    </Badge>
  );
}

export function ChannelAvatar({ channel }) {
  const avatar = channel.state && channel.state.lastAvatar;
  return (
    <div className="avatar" style={avatar ? undefined : { display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, background: '#5865f2' }}>
      {avatar ? (
        <img className="avatar" src={avatar} alt="" onError={(e) => (e.target.style.display = 'none')} />
      ) : (
        (channel.customName || channel.username || '?').slice(0, 1).toUpperCase()
      )}
    </div>
  );
}

export function DiscordDestination({ channel }) {
  const bits = [channel.serverName, channel.channelName && `#${channel.channelName}`].filter(Boolean);
  return <span>{bits.join(' • ') || <span className="hint">No Discord destination</span>}</span>;
}
