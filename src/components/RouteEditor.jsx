import React, { useState, useEffect } from 'react';

export default function RouteEditor({ route, onChangeRoute, onExportExpress, onExportOpenAPI }) {
  const [headers, setHeaders] = useState([]);
  const [bodyText, setBodyText] = useState('');
  const [jsonError, setJsonError] = useState(null);

  // Sync state when active route changes
  useEffect(() => {
    if (route) {
      setHeaders(route.headers || []);
      setBodyText(typeof route.body === 'object' ? JSON.stringify(route.body, null, 2) : route.body || '');
      setJsonError(null);
    }
  }, [route?.id]);

  if (!route) {
    return (
      <div className="workspace-column" style={{ borderRight: '1px solid var(--border-color)' }}>
        <div className="column-header">Configuration</div>
        <div className="column-content" style={{ justifyContent: 'center' }}>
          <div className="empty-state">
            <div className="empty-state-icon">⚙️</div>
            <div className="empty-state-title">No Endpoint Selected</div>
            <div className="empty-state-desc">Select an endpoint from the sidebar or click "Add" to start designing your API schema.</div>
          </div>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field, value) => {
    onChangeRoute(route.id, { [field]: value });
  };

  const handleBodyChange = (value) => {
    setBodyText(value);
    try {
      if (value.trim() === '') {
        onChangeRoute(route.id, { body: {} });
        setJsonError(null);
      } else {
        const parsed = JSON.parse(value);
        onChangeRoute(route.id, { body: parsed });
        setJsonError(null);
      }
    } catch (err) {
      setJsonError(err.message);
    }
  };

  // Header Handlers
  const handleAddHeader = () => {
    const newHeaders = [...headers, { key: '', value: '' }];
    setHeaders(newHeaders);
    onChangeRoute(route.id, { headers: newHeaders });
  };

  const handleRemoveHeader = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
    onChangeRoute(route.id, { headers: newHeaders });
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = headers.map((header, i) => {
      if (i === index) {
        return { ...header, [field]: value };
      }
      return header;
    });
    setHeaders(newHeaders);
    onChangeRoute(route.id, { headers: newHeaders });
  };

  return (
    <div className="workspace-column" style={{ borderRight: '1px solid var(--border-color)' }}>
      <div className="column-header">
        <span>Configure Endpoint</span>
      </div>

      <div className="column-content">
        {/* Method & Path */}
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">Method</label>
            <select
              className="input-field"
              value={route.method}
              onChange={(e) => handleFieldChange('method', e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Path</label>
            <input
              type="text"
              className="input-field input-field-mono"
              placeholder="/api/v1/users"
              value={route.path}
              onChange={(e) => handleFieldChange('path', e.target.value)}
            />
          </div>
        </div>

        {/* Status Code & Latency */}
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px', alignItems: 'center' }}>
          <div className="input-group">
            <label className="input-label">Status Code</label>
            <input
              type="number"
              className="input-field input-field-mono"
              placeholder="200"
              value={route.status}
              onChange={(e) => handleFieldChange('status', parseInt(e.target.value, 10) || 200)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Response Delay</label>
            <div className="slider-row">
              <div className="slider-container">
                <input
                  type="range"
                  className="slider-input"
                  min="0"
                  max="3000"
                  step="50"
                  value={route.latency}
                  onChange={(e) => handleFieldChange('latency', parseInt(e.target.value, 10))}
                />
                <span className="slider-val">{route.latency}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Headers Builder */}
        <div className="glass-panel" style={{ padding: '14px', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="test-section-title" style={{ margin: 0 }}>Response Headers</span>
            <button className="btn btn-secondary btn-sm" onClick={handleAddHeader} style={{ padding: '4px 8px', fontSize: '11px' }}>
              + Add Header
            </button>
          </div>
          {headers.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', padding: '8px' }}>
              No custom headers defined.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {headers.map((header, index) => (
                <div key={index} className="header-row">
                  <input
                    type="text"
                    className="input-field input-field-mono"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    placeholder="Key (e.g. Cache-Control)"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field input-field-mono"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  />
                  <button className="header-row-btn" onClick={() => handleRemoveHeader(index)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* JSON Body Editor */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">JSON Response Body Template</label>
            {jsonError && (
              <span style={{ fontSize: '11px', color: 'var(--color-delete)', fontFamily: 'var(--font-mono)' }}>
                Invalid JSON
              </span>
            )}
          </div>
          <div className="code-editor-wrapper">
            <textarea
              className="code-textarea"
              placeholder='{\n  "status": "success",\n  "users|3-6": {\n    "id": "{{id}}",\n    "name": "{{name}}",\n    "email": "{{email}}"\n  }\n}'
              value={bodyText}
              onChange={(e) => handleBodyChange(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Variable Helper Guide */}
        <div className="guide-box">
          <h4>Dynamic Mock Template Variables</h4>
          <ul>
            <li><code>{"{{id}}"}</code>: UUID</li>
            <li><code>{"{{index}}"}</code>: Loop index</li>
            <li><code>{"{{name}}"}</code>: Full Name</li>
            <li><code>{"{{email}}"}</code>: Email Address</li>
            <li><code>{"{{phone}}"}</code>: Phone Number</li>
            <li><code>{"{{city}}"}</code>: City</li>
            <li><code>{"{{country}}"}</code>: Country</li>
            <li><code>{"{{company}}"}</code>: Company</li>
            <li><code>{"{{date}}"}</code>: Date ISO</li>
            <li><code>{"{{number}}"}</code>: Random 1-100</li>
            <li><code>{"{{price}}"}</code>: Random Price</li>
            <li><code>{"{{boolean}}"}</code>: true/false</li>
            <li><code>{"{{avatar}}"}</code>: Image URL</li>
            <li><code>{"{{paragraph}}"}</code>: Paragraph</li>
          </ul>
          <div style={{ fontSize: '10px', color: '#c084fc', marginTop: '6px', borderTop: '1px solid rgba(139,92,246,0.15)', paddingTop: '6px' }}>
            💡 List expansion: suffix keys with <code>|count</code> or <code>|min-max</code> (e.g. <code>"users|5"</code>).
          </div>
        </div>

        {/* Code Generation Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onExportExpress(route)} title="Generate Node.js/Express.js script for this route">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Export Express.js
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onExportOpenAPI(route)} title="Generate OpenAPI 3.0 Swagger spec for this route">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Export OpenAPI Spec
          </button>
        </div>
      </div>
    </div>
  );
}
