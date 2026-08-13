import React from 'react';

const TOKEN_RE = /\{(creator|username|platform|title|game|viewers|url|thumbnail|avatar|started_at)\}/g;

function sub(text, data) {
  if (text == null) return text;
  return String(text).replace(TOKEN_RE, (_, key) => (data[key] == null ? '' : String(data[key])));
}

function fmtTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} at ${time}`;
}

export default function EmbedPreview({ template, data }) {
  const sections = template.sections || [];
  const by = (kind) => sections.find((s) => s.kind === kind);
  const fields = sections.filter((s) =>
    ['platform', 'streamtitle', 'game', 'viewers', 'startedat', 'field'].includes(s.kind)
  );

  const author = by('author');
  const title = by('title');
  const desc = by('description');
  const thumbnail = by('thumbnail');
  const image = by('image');
  const footer = by('footer');
  const timestamp = by('timestamp');

  const hasSidebar = thumbnail && sub(thumbnail.value, data);
  const showTimestamp = timestamp && timestamp.enabled;
  const footerText = footer ? sub(footer.text, data) : '';
  const footerIcon = footer ? sub(footer.icon, data) : '';

  const color = /^#[0-9a-fA-F]{6}$/.test(template.color || '') ? template.color : '#4f545c';

  const buttons = [];
  if (template.showWatchButton && sub(template.watchButtonUrl || '{url}', data)) {
    buttons.push({ label: sub(template.watchButtonLabel || 'Watch Live', data) || 'Watch Live', url: sub(template.watchButtonUrl || '{url}', data), primary: true });
  }
  for (const b of template.buttons || []) {
    const label = sub(b.label, data);
    const url = sub(b.url, data);
    if (label && url) buttons.push({ label, url, primary: false });
  }

  const renderFields = (
    <div className="de-fields">
      {fields.map((f) => {
        const name = sub(f.label, data);
        const value = sub(f.value, data);
        if (!name || !value) return null;
        return (
          <div className="de-field" key={f.id}>
            <div className="n">{name}</div>
            <div className="v">{value}</div>
          </div>
        );
      })}
    </div>
  );

  const renderHeader = (
    <div className="de-main">
      {author && sub(author.name, data) && (
        <div className="de-author">
          {sub(author.icon, data) && <img src={sub(author.icon, data)} alt="" onError={(e) => (e.target.style.display = 'none')} />}
          <span>{sub(author.name, data)}</span>
        </div>
      )}
      {title && sub(title.text, data) && <div className="de-title">{sub(title.text, data)}</div>}
      {desc && sub(desc.text, data) && <div className="de-desc">{sub(desc.text, data)}</div>}
      {renderFields}
    </div>
  );

  return (
    <div className="preview-wrap">
      <div className="preview-label">Live preview</div>
      <div className="discord-embed">
        <div className="de-color" style={{ background: color }} />
        <div className="de-body">
          <div className="de-flex">
            {renderHeader}
            {hasSidebar && (
              <div className="de-thumb">
                <img src={hasSidebar} alt="" onError={(e) => (e.target.style.display = 'none')} />
              </div>
            )}
          </div>
          {image && sub(image.value, data) && (
            <div className="de-image">
              <img src={sub(image.value, data)} alt="" onError={(e) => (e.target.style.display = 'none')} />
            </div>
          )}
          {(footerText || (showTimestamp && data.started_at)) && (
            <div className="de-footer">
              {footerIcon && <img src={footerIcon} alt="" onError={(e) => (e.target.style.display = 'none')} />}
              <span>{footerText}{footerText && showTimestamp && ' • '}{showTimestamp && fmtTime(data.started_at)}</span>
            </div>
          )}
        </div>
      </div>
      {buttons.length > 0 && (
        <div className="de-buttons" style={{ maxWidth: 520 }}>
          {buttons.map((b, i) => (
            <a key={i} className="de-btn link" style={b.primary ? undefined : { background: '#4e5058' }} href={b.url} target="_blank" rel="noreferrer">
              🔗 {b.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
