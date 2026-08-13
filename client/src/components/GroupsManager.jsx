import React, { useState } from 'react';
import { post, del } from '../api';
import { useToast } from '../context.jsx';

export default function GroupsManager({ groups, onChanged }) {
  const toast = useToast();
  const [name, setName] = useState('');

  async function add() {
    if (!name.trim()) return;
    try {
      await post('/groups', { name: name.trim() });
      toast(`Group "${name.trim()}" created`, 'ok');
      setName('');
      onChanged();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  async function remove(group) {
    if (!window.confirm(`Delete group "${group}"? Channels stay but move to "Ungrouped".`)) return;
    try {
      await del(`/groups/${encodeURIComponent(group)}`);
      toast('Group deleted', 'ok');
      onChanged();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  return (
    <div className="panel">
      <div className="page-title">Channel groups</div>
      <div className="page-sub">Organize your friends' channels into groups.</div>

      <div className="card">
        <div className="field">
          <label>New group name</label>
          <div className="btn-row">
            <input
              type="text"
              placeholder="e.g. NA Streamers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <button className="btn primary" onClick={add}>Create</button>
          </div>
        </div>
        {groups.length === 0 && <div className="empty">No groups yet.</div>}
        {groups.map((g) => (
          <div className="row-line" key={g}>
            <span className="mono" style={{ color: 'var(--accent)' }}>#</span>
            <b className="grow">{g}</b>
            <button className="btn danger small" onClick={() => remove(g)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
