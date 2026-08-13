import React from 'react';
import { PLATFORM_META } from '../api';

export default function History({ history }) {
  if (!history.length) {
    return <div className="empty">No notifications yet. Send a test notification or wait for a streamer to go live.</div>;
  }
  return (
    <div className="card">
      {history.map((h) => {
        const meta = PLATFORM_META[h.platform] || { label: h.platform || '—', color: '#5865f2' };
        return (
          <div className="history-item" key={h.id}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 5, background: h.ok ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
            <div className="h-body">
              <div className="h-title">
                {h.ok
                  ? h.title || (h.type === 'test' ? 'Test notification' : h.type === 'live' ? 'Went live' : 'New video')
                  : `Failed: ${h.title || 'notification'}`}
              </div>
              <div className="h-meta">
                <span style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                {' • '}
                {h.channelName || 'channel'}
                {h.sentTo ? ` → #${h.sentTo}` : ''}
                {' • '}
                {h.time ? new Date(h.time).toLocaleString() : ''}
              </div>
              {!h.ok && h.error && <div className="err" style={{ color: 'var(--red)', fontSize: 12, marginTop: 2 }}>{h.error}</div>}
              {h.url && (
                <div className="h-meta">
                  <a href={h.url} target="_blank" rel="noreferrer">Open ↗</a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
