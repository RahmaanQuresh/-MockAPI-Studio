import React, { useState } from 'react';

export default function LogsTimeline({ logs, onClearLogs }) {
  const [selectedLog, setSelectedLog] = useState(null);

  const handleCloseModal = () => setSelectedLog(null);

  return (
    <div className="workspace-column" style={{ borderRight: 'none' }}>
      <div className="column-header">
        <span>Request Logs ({logs.length})</span>
        {logs.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={onClearLogs} style={{ padding: '4px 8px', fontSize: '11px' }}>
            Clear Logs
          </button>
        )}
      </div>

      <div className="column-content" style={{ padding: '16px' }}>
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No Requests Logged</div>
            <div className="empty-state-desc">Send test requests from the tester panel to populate the live log timeline.</div>
          </div>
        ) : (
          <div className="timeline">
            {logs.map((log) => {
              const isSuccess = log.status >= 200 && log.status < 300;
              const badgeClass = `badge badge-${log.method.toLowerCase()}`;
              return (
                <div
                  key={log.id}
                  className="log-card"
                  onClick={() => setSelectedLog(log)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="log-header">
                    <div className="log-endpoint-info">
                      <span className={badgeClass}>{log.method}</span>
                      <span className="log-path" title={log.path}>{log.path}</span>
                    </div>
                    <div className="log-meta-right">
                      <span className={`log-status ${isSuccess ? 'log-status-success' : 'log-status-error'}`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span className="log-time" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      ⏱️ {log.durationMs}ms • 📂 {log.size}
                    </span>
                    <span className="log-timestamp" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Request Log Details</span>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Method and URL */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-${selectedLog.method.toLowerCase()}`} style={{ fontSize: '13px', padding: '4px 10px' }}>
                  {selectedLog.method}
                </span>
                <span className="input-field-mono" style={{ fontSize: '14px', wordBreak: 'break-all', color: 'var(--color-get)' }}>
                  {selectedLog.path}
                </span>
              </div>

              {/* Performance Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</div>
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: '600', 
                    color: selectedLog.status >= 200 && selectedLog.status < 300 ? '#10b981' : '#ef4444' 
                  }}>
                    {selectedLog.status}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Latency</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--border-focus)' }}>
                    {selectedLog.durationMs}ms
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Response Size</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {selectedLog.size}
                  </div>
                </div>
              </div>

              {/* Request Payload (if POST/PUT/DELETE) */}
              {selectedLog.requestBody && selectedLog.requestBody.trim() !== '{\n  \n}' && (
                <div>
                  <div className="test-section-title" style={{ marginBottom: '6px' }}>Request Body</div>
                  <div className="code-editor-wrapper" style={{ background: '#f7f3e8' }}>
                    <pre className="response-body-pre" style={{ color: 'var(--text-muted)', maxHeight: '150px', overflow: 'auto' }}>
                      {selectedLog.requestBody}
                    </pre>
                  </div>
                </div>
              )}

              {/* Response Payload */}
              <div>
                <div className="test-section-title" style={{ marginBottom: '6px' }}>Response Body</div>
                <div className="code-editor-wrapper" style={{ background: '#f7f3e8' }}>
                  <pre className="response-body-pre" style={{ maxHeight: '250px', overflow: 'auto' }}>
                    {JSON.stringify(selectedLog.responseBody, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <span style={{ marginRight: 'auto', fontSize: '11px', color: 'var(--text-dim)', alignSelf: 'center' }}>
                Logged at {selectedLog.timestamp}
              </span>
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
