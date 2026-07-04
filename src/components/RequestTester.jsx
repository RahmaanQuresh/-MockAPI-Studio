import React, { useState, useEffect } from 'react';
import { parseMockTemplate } from '../utils/mockEngine';

export default function RequestTester({ route, onLogRequest }) {
  const [activeTab, setActiveTab] = useState('params'); // params, headers, body
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [requestHeaders, setRequestHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [requestBody, setRequestBody] = useState('{\n  \n}');
  
  // Test execution state
  const [isSending, setIsSending] = useState(false);
  const [testResponse, setTestResponse] = useState(null);

  // Reset tester state when route changes
  useEffect(() => {
    if (route) {
      setQueryParams([{ key: '', value: '' }]);
      setRequestBody('{\n  \n}');
      setTestResponse(null);
      setIsSending(false);
      // Auto switch tabs based on method
      if (route.method === 'GET') {
        setActiveTab('params');
      } else {
        setActiveTab('body');
      }
    }
  }, [route?.id]);

  if (!route) {
    return (
      <div className="workspace-column">
        <div className="column-header">Request Tester</div>
        <div className="column-content" style={{ justifyContent: 'center' }}>
          <div className="empty-state">
            <div className="empty-state-icon">⚡</div>
            <div className="empty-state-title">No Endpoint Loaded</div>
            <div className="empty-state-desc">Select an endpoint in the sidebar to simulate HTTP requests and view dynamic responses.</div>
          </div>
        </div>
      </div>
    );
  }

  // Params handlers
  const handleAddParam = () => setQueryParams([...queryParams, { key: '', value: '' }]);
  const handleRemoveParam = (index) => setQueryParams(queryParams.filter((_, i) => i !== index));
  const handleParamChange = (index, field, value) => {
    setQueryParams(queryParams.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  // Headers handlers
  const handleAddHeader = () => setRequestHeaders([...requestHeaders, { key: '', value: '' }]);
  const handleRemoveHeader = (index) => setRequestHeaders(requestHeaders.filter((_, i) => i !== index));
  const handleHeaderChange = (index, field, value) => {
    setRequestHeaders(requestHeaders.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  };

  // Build full query string
  const getQueryString = () => {
    const activeParams = queryParams.filter(p => p.key.trim() !== '');
    if (activeParams.length === 0) return '';
    return '?' + activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
  };

  // Execute Mock Request
  const handleSendRequest = () => {
    setIsSending(true);
    setTestResponse(null);

    const startTime = performance.now();

    // Prepare context for template parser
    const queryContext = {};
    queryParams.forEach(p => {
      if (p.key.trim() !== '') queryContext[p.key.trim()] = p.value;
    });

    let bodyContext = {};
    try {
      if (route.method !== 'GET' && requestBody.trim() !== '') {
        bodyContext = JSON.parse(requestBody);
      }
    } catch (e) {
      // Ignore invalid JSON body for context
    }

    const context = {
      query: queryContext,
      body: bodyContext,
      headers: requestHeaders.reduce((acc, curr) => {
        if (curr.key.trim() !== '') acc[curr.key.trim()] = curr.value;
        return acc;
      }, {})
    };

    // Simulate delay
    setTimeout(() => {
      let finalResponseBody = {};
      let parseSuccess = true;
      let errorMessage = null;

      try {
        finalResponseBody = parseMockTemplate(route.body || {}, 1, context);
      } catch (err) {
        parseSuccess = false;
        errorMessage = err.message;
        finalResponseBody = {
          error: "Mock Engine Parsing Error",
          message: err.message
        };
      }

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      // Create headers response
      const responseHeaders = [
        { key: 'Content-Type', value: 'application/json; charset=utf-8' },
        { key: 'X-Powered-By', value: 'Antigravity Mock Engine' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }
      ];

      // Add custom route configured headers
      if (route.headers && route.headers.length > 0) {
        route.headers.forEach(h => {
          if (h.key.trim() !== '') {
            responseHeaders.push({ key: h.key.trim(), value: h.value });
          }
        });
      }

      const responseSize = JSON.stringify(finalResponseBody).length;
      const formattedSize = responseSize > 1024 
        ? `${(responseSize / 1024).toFixed(2)} KB` 
        : `${responseSize} B`;

      const responsePayload = {
        status: parseSuccess ? route.status : 500,
        statusText: parseSuccess ? getStatusText(route.status) : 'Internal Server Error',
        durationMs,
        size: formattedSize,
        headers: responseHeaders,
        body: finalResponseBody
      };

      setTestResponse(responsePayload);
      setIsSending(false);

      // Log request in global history log
      onLogRequest({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        method: route.method,
        path: route.path + getQueryString(),
        status: responsePayload.status,
        durationMs,
        size: formattedSize,
        requestBody: route.method !== 'GET' ? requestBody : null,
        responseBody: finalResponseBody
      });
    }, route.latency);
  };

  const getStatusText = (status) => {
    const statuses = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable'
    };
    return statuses[status] || 'Unknown';
  };

  const isPayloadMethod = ['POST', 'PUT', 'DELETE'].includes(route.method);

  return (
    <div className="workspace-column">
      <div className="column-header">
        <span>Request Tester</span>
      </div>

      <div className="column-content">
        {/* URL Test Bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`badge badge-${route.method.toLowerCase()}`} style={{ height: '36px', width: '70px', fontSize: '13px' }}>
            {route.method}
          </span>
          <div className="input-field input-field-mono" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'rgba(8, 12, 20, 0.5)', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)' }}>http://localhost/</span>
            <span style={{ color: 'var(--color-get)' }}>{route.path.replace(/^\//, '')}</span>
            <span style={{ color: 'var(--text-muted)' }}>{getQueryString()}</span>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleSendRequest}
            disabled={isSending}
            style={{ height: '36px' }}
          >
            Send
          </button>
        </div>

        {/* Tab Selection */}
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'params' ? 'active' : ''}`}
            onClick={() => setActiveTab('params')}
          >
            Params
          </button>
          <button 
            className={`tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </button>
          {isPayloadMethod && (
            <button 
              className={`tab-btn ${activeTab === 'body' ? 'active' : ''}`}
              onClick={() => setActiveTab('body')}
            >
              Body
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div style={{ minHeight: '130px' }}>
          {activeTab === 'params' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {queryParams.map((p, idx) => (
                <div key={idx} className="header-row" style={{ gridTemplateColumns: '1fr 1fr 32px' }}>
                  <input
                    type="text"
                    className="input-field input-field-mono"
                    placeholder="Key"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    value={p.key}
                    onChange={(e) => handleParamChange(idx, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field input-field-mono"
                    placeholder="Value"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    value={p.value}
                    onChange={(e) => handleParamChange(idx, 'value', e.target.value)}
                  />
                  <button className="header-row-btn" onClick={() => handleRemoveParam(idx)}>
                    &times;
                  </button>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={handleAddParam} style={{ width: 'fit-content', padding: '4px 10px', fontSize: '11px', marginTop: '4px' }}>
                + Add Parameter
              </button>
            </div>
          )}

          {activeTab === 'headers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {requestHeaders.map((h, idx) => (
                <div key={idx} className="header-row" style={{ gridTemplateColumns: '1fr 1fr 32px' }}>
                  <input
                    type="text"
                    className="input-field input-field-mono"
                    placeholder="Header Key"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    value={h.key}
                    onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field input-field-mono"
                    placeholder="Value"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    value={h.value}
                    onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                  />
                  <button className="header-row-btn" onClick={() => handleRemoveHeader(idx)}>
                    &times;
                  </button>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={handleAddHeader} style={{ width: 'fit-content', padding: '4px 10px', fontSize: '11px', marginTop: '4px' }}>
                + Add Header
              </button>
            </div>
          )}

          {activeTab === 'body' && isPayloadMethod && (
            <div className="code-editor-wrapper">
              <textarea
                className="code-textarea"
                style={{ height: '110px' }}
                placeholder='{\n  "key": "value"\n}'
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Response Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, marginTop: '12px' }}>
          <span className="test-section-title">Response</span>
          <div className="response-window">
            {isSending && (
              <div className="pulse-overlay">
                <div className="pulse-spinner"></div>
                <span className="pulse-text">CALLING API (DELAY {route.latency}ms)...</span>
              </div>
            )}

            {testResponse ? (
              <>
                <div className="response-meta">
                  <span 
                    className="badge" 
                    style={{ 
                      background: testResponse.status >= 400 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: testResponse.status >= 400 ? 'var(--color-delete)' : 'var(--color-post)',
                      fontSize: '11px' 
                    }}
                  >
                    {testResponse.status} {testResponse.statusText}
                  </span>
                  <div className="response-meta-stats">
                    <span>Time: <strong style={{ color: '#00f2fe' }}>{testResponse.durationMs} ms</strong></span>
                    <span>Size: <strong style={{ color: '#00f2fe' }}>{testResponse.size}</strong></span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 33px)' }}>
                  <pre className="response-body-pre">
                    {JSON.stringify(testResponse.body, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              !isSending && (
                <div className="response-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  <span>Click "Send" to fire mock request</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
