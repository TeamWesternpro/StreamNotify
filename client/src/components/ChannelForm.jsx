import React, { useState } from 'react';
import { post, put } from '../api';
import { useToast } from '../context';
import { Modal, Toggle, PlatformTag } from './common.jsx';
import { PLATFORM_META } from '../api';

export default function ChannelForm({ initial, type, guilds, platforms, groups, onSaved, onClose }) {
  const toast = useToast();
  const editing = Boolean(initial);

  const [form, setForm] = useState(() => ({
    type: initial ? initial.type : type,
    platform: initial ? initial.platform : 'twitch',
    username: initial ? initial.username : '',
    customName: initial ? initial.customName || '' : '',
    group: initial ? initial.group || '' : '',
    serverId: initial ? initial.serverId || '' : '',
    serverName: initial ? initial.serverName || '' : '',
    channelId: initial ? initial.channelId || '' : '',
    channelName: initial ? initial.channelName || '' : '',
    roleMentionEnabled: initial ? Boolean(initial.roleMentionEnabled) : false,
    roleId: initial ? initial.roleId || '' : '',
    roleName: initial ? initial.roleName || '' : '',
    notificationsEnabled: initial ? initial.notificationsEnabled !== false : true,
    notifyLive: initial ? initial.notifyLive !== false : true,
    notifyVideo: initial ? initial.notifyVideo !== false : true,
    newGroup: '',
  }));

  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const server = guilds.find((g) => g.id === form.serverId);
  const channels = server ? server.channels : [];
  const roles = server ? server.roles || [] : [];

  async function handleCheck() {
    setChecking(true);
    setChecked(null);
    try {
      const info = await post(`/platforms/${form.platform}/check`, { username: form.username });
      setChecked(info);
      if (!form.customName) set('customName', info.displayName || info.username);
      toast(`Found: ${info.displayName || info.username}`, 'ok');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setChecking(false);
    }
  }

  async function handleSave() {
    try {
      if (!form.username) throw new Error('Username is required');
      const serverName = server ? server.name : form.serverName;
      const channelName = server ? (channels.find((c) => c.id === form.channelId) || {}).name : form.channelName;
      const roleName = server ? (roles.find((r) => r.id === form.roleId) || {}).name : form.roleName;
      const payload = {
        ...form,
        group: form.group || form.newGroup || 'Ungrouped',
        serverName,
        channelName,
        roleName: form.roleMentionEnabled ? roleName : '',
        template: initial ? initial.template : null,
      };
      if (editing) {
        await put(`/channels/${initial.id}`, payload);
        toast('Channel updated', 'ok');
      } else {
        await post('/channels', payload);
        toast('Channel added — checking status…', 'ok');
      }
      onSaved();
      onClose();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  return (
    <Modal title={editing ? 'Edit channel' : `Add ${form.type === 'friend' ? "friend's" : 'your'} channel`} onClose={onClose}>
      <div className="row2">
        <div className="field">
          <label>Platform</label>
          <select value={form.platform} onChange={(e) => set('platform', e.target.value)}>
            {platforms.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Custom name</label>
          <input
            type="text"
            placeholder={checked ? checked.displayName || checked.username : 'e.g. My Gaming Channel'}
            value={form.customName}
            onChange={(e) => set('customName', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label>Channel URL / username / handle</label>
        <div className="btn-row">
          <input
            type="text"
            placeholder={PLATFORM_META[form.platform]?.channel || ''}
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
          />
          <button className="btn small" onClick={handleCheck} disabled={checking || !form.username}>
            {checking ? 'Checking…' : 'Check'}
          </button>
        </div>
        {checked && (
          <div className="hint" style={{ color: 'var(--green)' }}>
            ✓ {checked.displayName || checked.username}
            {checked.followers ? ` • ${checked.followers} followers` : ''}
          </div>
        )}
      </div>

      {form.type === 'friend' && (
        <div className="row2">
          <div className="field">
            <label>Group</label>
            <select value={form.group} onChange={(e) => set('group', e.target.value)}>
              <option value="">— select —</option>
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
              <option value="Ungrouped">Ungrouped</option>
            </select>
          </div>
          <div className="field">
            <label>Or new group name</label>
            <input type="text" placeholder="e.g. NA Streamers" value={form.newGroup} onChange={(e) => set('newGroup', e.target.value)} />
          </div>
        </div>
      )}

      <div className="section-title">Discord destination</div>
      <div className="row2">
        <div className="field">
          <label>Server</label>
          <select value={form.serverId} onChange={(e) => {
            set('serverId', e.target.value);
            set('channelId', '');
            set('roleId', '');
          }}>
            <option value="">— select server —</option>
            {guilds.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Text channel</label>
          <select value={form.channelId} onChange={(e) => set('channelId', e.target.value)} disabled={!form.serverId}>
            <option value="">— select channel —</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row2" style={{ alignItems: 'end' }}>
        <div className="field">
          <label>Role mention (optional)</label>
          <select value={form.roleId} onChange={(e) => set('roleId', e.target.value)} disabled={!form.serverId}>
            <option value="">— no role —</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>@{r.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>&nbsp;</label>
          <Toggle checked={form.roleMentionEnabled} onChange={(v) => set('roleMentionEnabled', v)} label="Mention this role" />
        </div>
      </div>

      <div className="section-title">Notifications</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Toggle checked={form.notificationsEnabled} onChange={(v) => set('notificationsEnabled', v)} label="Enable notifications for this channel" />
        <Toggle checked={form.notifyLive} onChange={(v) => set('notifyLive', v)} label="Notify when going live" disabled={!form.notificationsEnabled} />
        <Toggle checked={form.notifyVideo} onChange={(v) => set('notifyVideo', v)} label="Notify on new videos" disabled={!form.notificationsEnabled} />
      </div>

      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={handleSave}>
          {editing ? 'Save changes' : 'Add channel'}
        </button>
      </div>
    </Modal>
  );
}
