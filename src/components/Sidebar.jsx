import React, { useRef } from 'react';

export default function Sidebar({
  routes,
  selectedRouteId,
  onSelectRoute,
  onCreateRoute,
  onDeleteRoute,
  onImportConfig,
  onExportConfig,
  onClearAll
}) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        onImportConfig(parsed);
      } catch (err) {
        alert('Invalid configuration file. Please upload a valid JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="workspace-column" style={{ borderRight: '1px solid var(--border-color)' }}>
      <div className="column-header">
        <span>Endpoints ({routes.length})</span>
        <button className="btn btn-primary btn-sm" onClick={onCreateRoute}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add
        </button>
      </div>

      <div className="column-content" style={{ padding: '16px', gap: '8px' }}>
        {routes.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 10px' }}>
            <div className="empty-state-icon">📡</div>
            <div className="empty-state-title" style={{ fontSize: '14px' }}>No Endpoints</div>
            <div className="empty-state-desc" style={{ fontSize: '12px' }}>Create an endpoint to get started</div>
          </div>
        ) : (
          <div className="route-list">
            {routes.map((route) => {
              const isActive = route.id === selectedRouteId;
              const methodClass = `badge badge-${route.method.toLowerCase()}`;
              return (
                <div
                  key={route.id}
                  className={`route-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectRoute(route.id)}
                >
                  <div className="route-item-info">
                    <span className={methodClass}>{route.method}</span>
                    <span className="route-item-path" title={route.path}>{route.path}</span>
                  </div>
                  <button
                    className="btn-danger"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoute(route.id);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-delete)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                    title="Delete endpoint"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'rgba(8, 12, 20, 0.4)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleImportClick} title="Import configurations from JSON file">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Import
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onExportConfig} disabled={routes.length === 0} title="Export configurations as a JSON file">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
        <button className="btn btn-danger btn-sm" onClick={onClearAll} disabled={routes.length === 0} style={{ width: '100%' }} title="Clear all endpoints and history">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
          Reset Environment
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
