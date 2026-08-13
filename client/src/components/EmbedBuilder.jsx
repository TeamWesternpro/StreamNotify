import React, { useCallback, useEffect, useRef, useState } from 'react';
import { put, post } from '../api';
import { useToast } from '../context';
import EmbedPreview from './EmbedPreview.jsx';
import { Toggle } from './common.jsx';

const KIND_LABEL = {
  author: 'Author', title: 'Title', description: 'Description',
  platform: 'Platform', streamtitle: 'Stream title', game: 'Game',
  viewers: 'Viewers', startedat: 'Started at', field: 'Custom field',
  thumbnail: 'Thumbnail', image: 'Large image', footer: 'Footer', timestamp: 'Timestamp',
};

const ADDABLE = [
  'platform', 'streamtitle', 'game', 'viewers', 'startedat', 'field', 'thumbnail', 'image', 'footer', 'timestamp',
];

function newSection(kind) {
  const base = { id: 's-' + Math.random().toString(36).slice(2, 8), kind };
  const defs = {
    platform: { label: 'Platform', value: '{platform}' },
    streamtitle: { label: 'Stream', value: '{title}' },
    game: { label: 'Game', value: '{game}' },
    viewers: { label: 'Viewers', value: '{viewers}' },
    startedat: { label: 'Started', value: '{started_at}' },
    field: { label: 'Custom', value: '' },
    thumbnail: { value: '{thumbnail}' },
    image: { value: '' },
    footer: { text: '', icon: '' },
    timestamp: { enabled: true },
    author: { name: '{creator}', icon: '{avatar}' },
    title: { text: '{creator} is live on {platform}!' },
    description: { text: '{title}' },
  };
  return { ...base, ...defs[kind] };
}

const SAMPLE = {
  creator: 'Chipfinity',
  username: 'chipfinity',
  platform: 'Twitch',
  title: 'Ranked grind with the squad! We are finally back live',
  game: 'Valorant',
  viewers: '1234',
  url: 'https://twitch.tv/chipfinity',
  thumbnail: 'https://picsum.photos/seed/streamer-notify/640/360',
  avatar: 'https://picsum.photos/seed/streamer-avatar/128/128',
  started_at: new Date().toISOString(),
};

// ---- small presentational helpers (module scope to avoid remount/focus loss) ----

function FocusedInput({ register, index, inputKey, ...props }) {
  return (
    <input
      {...props}
      onFocus={(e) => register({ index, key: inputKey, el: e.target })}
    />
  );
}

function FocusedArea({ register, index, inputKey, ...props }) {
  return (
    <textarea
      {...props}
      onFocus={(e) => register({ index, key: inputKey, el: e.target })}
    />
  );
}

function VarInsert({ variables, onInsert }) {
  return (
    <select
      className="mono"
      style={{ width: 96, padding: '4px 6px', flexShrink: 0 }}
      value=""
      onChange={(e) => e.target.value && onInsert(e.target.value)}
    >
      <option value="">➕ var</option>
      {variables.map((v) => (
        <option key={v.name} value={v.name}>{'{'}{v.name}{'}'}</option>
      ))}
    </select>
  );
}

export default function EmbedBuilder({ channels, defaultTemplate, variables, guilds, onSaved }) {
  const toast = useToast();
  const [scope, setScope] = useState('default');
  const [template, setTemplate] = useState(() => structuredClone(defaultTemplate));
  const [dest, setDest] = useState({ serverId: '', channelId: '' });
  const [addKind, setAddKind] = useState('platform');
  const [dragIndex, setDragIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const focusRef = useRef(null);

  const channel = scope !== 'default' ? channels.find((c) => c.id === scope) : null;

  useEffect(() => {
    setTemplate(structuredClone(channel && channel.template ? channel.template : defaultTemplate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const register = useCallback((f) => {
    focusRef.current = f;
  }, []);

  function setField(index, key, value) {
    setTemplate((t) => {
      const sections = t.sections.map((s, i) => (i === index ? { ...s, [key]: value } : s));
      return { ...t, sections };
    });
  }

  function updateSection(index, patch) {
    setTemplate((t) => {
      const sections = t.sections.map((s, i) => (i === index ? { ...s, ...patch } : s));
      return { ...t, sections };
    });
  }

  function addSection() {
    setTemplate((t) => ({ ...t, sections: [...t.sections, newSection(addKind)] }));
  }

  function removeSection(index) {
    setTemplate((t) => ({ ...t, sections: t.sections.filter((_, i) => i !== index) }));
  }

  function moveSection(from, to) {
    setTemplate((t) => {
      const sections = [...t.sections];
      const [moved] = sections.splice(from, 1);
      sections.splice(to, 0, moved);
      return { ...t, sections };
    });
  }

  function insertVar(name) {
    const f = focusRef.current;
    if (!f || !f.el) {
      toast('Click into a text field first, then insert the variable', 'warn');
      return;
    }
    if (f.index < 0) {
      toast('Variables can only be inserted into section fields', 'warn');
      return;
    }
    const el = f.el;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + `{${name}}` + el.value.slice(end);
    updateSection(f.index, { [f.key]: next });
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + name.length + 2;
      el.setSelectionRange(pos, pos);
    });
  }

  function renderSectionBody(sec, i) {
    switch (sec.kind) {
      case 'author':
        return (
          <div className="grow" style={{ flexWrap: 'wrap' }}>
            <FocusedInput register={register} index={i} inputKey="name" value={sec.name} placeholder="Author name" onChange={(v) => setField(i, 'name', v)} style={{ flex: 2, minWidth: 120 }} />
            <FocusedInput register={register} index={i} inputKey="icon" value={sec.icon} placeholder="Author icon URL" onChange={(v) => setField(i, 'icon', v)} style={{ flex: 3, minWidth: 140 }} />
            <VarInsert variables={variables} onInsert={insertVar} />
          </div>
        );
      case 'title':
        return (
          <div className="grow">
            <FocusedInput register={register} index={i} inputKey="text" value={sec.text} placeholder="Title text" onChange={(v) => setField(i, 'text', v)} />
            <VarInsert variables={variables} onInsert={insertVar} />
          </div>
        );
      case 'description':
        return (
          <div className="grow" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <FocusedArea register={register} index={i} inputKey="text" value={sec.text} placeholder="Description" onChange={(v) => setField(i, 'text', v)} style={{ minHeight: 54, fontSize: 12 }} />
            <div style={{ marginTop: 4 }}><VarInsert variables={variables} onInsert={insertVar} /></div>
          </div>
        );
      case 'thumbnail':
      case 'image':
        return (
          <div className="grow">
            <FocusedInput register={register} index={i} inputKey="value" value={sec.value} placeholder={sec.kind === 'thumbnail' ? '{thumbnail} or image URL' : 'Large image URL'} onChange={(v) => setField(i, 'value', v)} />
            <VarInsert variables={variables} onInsert={insertVar} />
          </div>
        );
      case 'footer':
        return (
          <div className="grow" style={{ flexWrap: 'wrap' }}>
            <FocusedInput register={register} index={i} inputKey="text" value={sec.text} placeholder="Footer text" onChange={(v) => setField(i, 'text', v)} style={{ flex: 2, minWidth: 120 }} />
            <FocusedInput register={register} index={i} inputKey="icon" value={sec.icon} placeholder="Footer icon URL" onChange={(v) => setField(i, 'icon', v)} style={{ flex: 3, minWidth: 140 }} />
            <VarInsert variables={variables} onInsert={insertVar} />
          </div>
        );
      case 'timestamp':
        return (
          <div className="grow">
            <Toggle checked={sec.enabled} onChange={(v) => setField(i, 'enabled', v)} label="Show timestamp" />
          </div>
        );
      default:
        return (
          <div className="grow" style={{ flexWrap: 'wrap' }}>
            <FocusedInput register={register} index={i} inputKey="label" value={sec.label} placeholder="Field label" onChange={(v) => setField(i, 'label', v)} style={{ flex: 1, minWidth: 90 }} />
            <FocusedInput register={register} index={i} inputKey="value" value={sec.value} placeholder="Value" onChange={(v) => setField(i, 'value', v)} style={{ flex: 2, minWidth: 120 }} />
            <VarInsert variables={variables} onInsert={insertVar} />
          </div>
        );
    }
  }

  async function save() {
    setSaving(true);
    try {
      if (scope === 'default') {
        await put('/settings', { defaultTemplate: template });
      } else {
        await put(`/channels/${scope}`, { template });
      }
      toast('Template saved', 'ok');
      onSaved();
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setSaving(false);
    }
  }

  async function test() {
    if (!dest.channelId) return toast('Select a Discord server/channel for the test', 'warn');
    setTesting(true);
    try {
      const server = guilds.find((g) => g.id === dest.serverId);
      const ch = server && server.channels.find((c) => c.id === dest.channelId);
      const res = await post('/test', {
        template,
        channelId: dest.channelId,
        serverId: dest.serverId,
        channelName: ch && ch.name,
        serverName: server && server.name,
        data: SAMPLE,
      });
      if (!res.ok) throw new Error(res.error || 'Failed to send');
      toast('Test embed sent to Discord', 'ok');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setTesting(false);
    }
  }

  const destServer = guilds.find((g) => g.id === dest.serverId);
  const destChannels = destServer ? destServer.channels : [];

  return (
    <div>
      <h1 className="page-title">Embed Builder</h1>
      <p className="page-sub">Design the notification embed. Drag blocks to reorder, use variables, and preview live.</p>

      <div className="builder">
        <div>
          <div className="card">
            <div className="row2">
              <div className="field">
                <label>Apply template to</label>
                <select value={scope} onChange={(e) => setScope(e.target.value)}>
                  <option value="default">Default (all channels)</option>
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customName || c.username} ({c.platform})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Test destination (Discord)</label>
                <select value={dest.serverId} onChange={(e) => setDest({ serverId: e.target.value, channelId: '' })}>
                  <option value="">— server —</option>
                  {guilds.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label>&nbsp;</label>
                <select value={dest.channelId} disabled={!dest.serverId} onChange={(e) => setDest((d) => ({ ...d, channelId: e.target.value }))}>
                  <option value="">— channel —</option>
                  {destChannels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Embed color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(template.color) ? template.color : '#9146FF'}
                    onChange={(e) => setTemplate((t) => ({ ...t, color: e.target.value }))}
                    style={{ width: 44, height: 34, padding: 2, border: '1px solid var(--border)', background: 'transparent' }}
                  />
                  <FocusedInput
                    register={register}
                    index={-1}
                    inputKey="color"
                    value={template.color || ''}
                    placeholder="#9146FF"
                    onChange={(v) => setTemplate((t) => ({ ...t, color: v }))}
                    style={{ width: 110 }}
                  />
                </div>
              </div>
            </div>
            {channel && (
              <div className="hint">
                Editing the embed for <b>{channel.customName || channel.username}</b>. Channels without their own template use the default.
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="section-title" style={{ marginTop: 0 }}>Embed blocks (drag to reorder)</div>
            {template.sections.map((sec, i) => (
              <div
                key={sec.id}
                className={`sec-row ${dragIndex === i ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (dragIndex !== null && dragIndex !== i) { moveSection(dragIndex, i); setDragIndex(null); } }}
              >
                <span className="drag" title="Drag to reorder">⠿</span>
                <span className="kind" style={{ minWidth: 92 }}>{KIND_LABEL[sec.kind]}</span>
                {renderSectionBody(sec, i)}
                <button className="del" title="Remove block" onClick={() => removeSection(i)}>✕</button>
              </div>
            ))}

            <div className="btn-row" style={{ marginTop: 10 }}>
              <select value={addKind} onChange={(e) => setAddKind(e.target.value)} style={{ width: 180 }}>
                {ADDABLE.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
              </select>
              <button className="btn small" onClick={addSection}>+ Add block</button>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="section-title" style={{ marginTop: 0 }}>Buttons</div>
            <div style={{ marginBottom: 10 }}>
              <Toggle
                checked={template.showWatchButton}
                onChange={(v) => setTemplate((t) => ({ ...t, showWatchButton: v }))}
                label="Watch stream / video button"
              />
            </div>
            {template.showWatchButton && (
              <div className="row2" style={{ marginBottom: 10 }}>
                <FocusedInput
                  register={register} index={-1} inputKey="watchLabel"
                  value={template.watchButtonLabel || ''} placeholder="Button label (e.g. Watch Live)"
                  onChange={(v) => setTemplate((t) => ({ ...t, watchButtonLabel: v }))}
                />
                <FocusedInput
                  register={register} index={-1} inputKey="watchUrl"
                  value={template.watchButtonUrl || ''} placeholder="URL (e.g. {url})"
                  onChange={(v) => setTemplate((t) => ({ ...t, watchButtonUrl: v }))}
                />
              </div>
            )}

            {(template.buttons || []).map((b, i) => (
              <div className="sec-row" key={b.id}>
                <span className="drag" style={{ cursor: 'default' }}>🔘</span>
                <div className="grow" style={{ flexWrap: 'wrap' }}>
                  <FocusedInput
                    register={register} index={-2} inputKey={`b-${i}-label`}
                    value={b.label} placeholder="Button label" style={{ flex: 1, minWidth: 100 }}
                    onChange={(v) => {
                      const buttons = template.buttons.map((x, j) => (j === i ? { ...x, label: v } : x));
                      setTemplate((t) => ({ ...t, buttons }));
                    }}
                  />
                  <FocusedInput
                    register={register} index={-2} inputKey={`b-${i}-url`}
                    value={b.url} placeholder="URL" style={{ flex: 2, minWidth: 130 }}
                    onChange={(v) => {
                      const buttons = template.buttons.map((x, j) => (j === i ? { ...x, url: v } : x));
                      setTemplate((t) => ({ ...t, buttons }));
                    }}
                  />
                </div>
                <button
                  className="del"
                  onClick={() => setTemplate((t) => ({ ...t, buttons: t.buttons.filter((x) => x.id !== b.id) }))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="btn small"
              onClick={() =>
                setTemplate((t) => ({
                  ...t,
                  buttons: [...(t.buttons || []), { id: 'b-' + Math.random().toString(36).slice(2, 8), label: 'Custom', url: '' }],
                }))
              }
            >
              + Add custom button
            </button>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="section-title" style={{ marginTop: 0 }}>Variables</div>
            <div className="hint" style={{ marginBottom: 8 }}>
              Click into a field, then click a variable to insert it. Variables are replaced with real data when the notification is sent.
            </div>
            <div className="var-group">
              {variables.map((v) => (
                <button key={v.name} className="var-pill" title={v.label} onClick={() => insertVar(v.name)}>
                  {'{'}{v.name}{'}'}
                </button>
              ))}
            </div>
          </div>

          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save template'}
            </button>
            <button className="btn" onClick={test} disabled={testing || !dest.channelId}>
              {testing ? 'Sending…' : '📨 Send test to Discord'}
            </button>
            {channel && (
              <button className="btn ghost" onClick={() => setTemplate(structuredClone(defaultTemplate))}>
                Reset to default
              </button>
            )}
          </div>
        </div>

        <div className="sticky">
          <EmbedPreview template={template} data={SAMPLE} />
          <div className="preview-wrap" style={{ marginTop: 12 }}>
            <div className="preview-label">Preview data</div>
            <div className="hint">
              Shown with sample data. Real values use the streamer's live stream or latest video at send time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
