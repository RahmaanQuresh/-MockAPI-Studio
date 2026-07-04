import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RouteEditor from './components/RouteEditor';
import RequestTester from './components/RequestTester';
import LogsTimeline from './components/LogsTimeline';

// Prepopulated mock endpoints
const DEFAULT_ROUTES = [
  {
    id: 'r-1',
    method: 'GET',
    path: '/api/v1/users/:userId',
    status: 200,
    latency: 300,
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Cache-Control', value: 'max-age=3600' }
    ],
    body: {
      status: "success",
      userId: "{{params.userId}}",
      user: {
        id: "{{id}}",
        name: "{{name}}",
        email: "{{email}}",
        avatar: "{{avatar}}",
        company: "{{company}}",
        location: {
          city: "{{city}}",
          country: "{{country}}"
        },
        isActive: "{{boolean}}",
        joinedDate: "{{date}}"
      }
    }
  },
  {
    id: 'r-2',
    method: 'POST',
    path: '/api/v1/posts',
    status: 201,
    latency: 800,
    headers: [
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: {
      message: "Post created successfully",
      postId: "{{id}}",
      createdByUser: "{{body.userId}}",
      postDetails: {
        title: "{{body.title}}",
        likes: "{{number}}",
        createdAt: "{{date}}"
      }
    }
  },
  {
    id: 'r-3',
    method: 'GET',
    path: '/api/v1/feed',
    status: 200,
    latency: 500,
    headers: [
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: {
      feedId: "{{id}}",
      totalPosts: 5,
      "posts|5": {
        id: "{{id}}",
        index: "{{index}}",
        title: "Dynamic Feed Post {{index}}",
        author: {
          name: "{{name}}",
          avatar: "{{avatar}}"
        },
        metrics: {
          views: "{{number}}",
          priceEstimate: "{{price}}"
        },
        published: "{{boolean}}"
      }
    }
  }
];

export default function App() {
  const [routes, setRoutes] = useState(() => {
    const saved = localStorage.getItem('mock_api_routes');
    return saved ? JSON.parse(saved) : DEFAULT_ROUTES;
  });

  const [selectedRouteId, setSelectedRouteId] = useState(() => {
    const saved = localStorage.getItem('mock_api_routes');
    const loadedRoutes = saved ? JSON.parse(saved) : DEFAULT_ROUTES;
    return loadedRoutes.length > 0 ? loadedRoutes[0].id : null;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('mock_api_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal State for Code Generation Exporter
  const [modalContent, setModalContent] = useState(null); // { title: '', code: '', mode: 'express' | 'openapi' }
  const [copied, setCopied] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('mock_api_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('mock_api_logs', JSON.stringify(logs));
  }, [logs]);

  // Route Handlers
  const handleSelectRoute = (id) => {
    setSelectedRouteId(id);
  };

  const handleCreateRoute = () => {
    const newId = `r-${Date.now()}`;
    const newRoute = {
      id: newId,
      method: 'GET',
      path: `/api/v1/endpoint-${routes.length + 1}`,
      status: 200,
      latency: 0,
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      body: {
        status: "success",
        data: {
          id: "{{id}}",
          timestamp: "{{date}}"
        }
      }
    };
    setRoutes([...routes, newRoute]);
    setSelectedRouteId(newId);
  };

  const handleDeleteRoute = (id) => {
    const newRoutes = routes.filter(r => r.id !== id);
    setRoutes(newRoutes);
    if (selectedRouteId === id) {
      setSelectedRouteId(newRoutes.length > 0 ? newRoutes[0].id : null);
    }
  };

  const handleChangeRoute = (id, updatedFields) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, ...updatedFields } : r));
  };

  // Import / Export JSON config
  const handleImportConfig = (importedConfig) => {
    if (Array.isArray(importedConfig)) {
      setRoutes(importedConfig);
      if (importedConfig.length > 0) {
        setSelectedRouteId(importedConfig[0].id);
      }
    }
  };

  const handleExportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "mock_api_routes.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to reset all routes to default configurations and clear log history?")) {
      setRoutes(DEFAULT_ROUTES);
      setSelectedRouteId(DEFAULT_ROUTES[0].id);
      setLogs([]);
      localStorage.removeItem('mock_api_routes');
      localStorage.removeItem('mock_api_logs');
    }
  };

  // Request Log Handlers
  const handleLogRequest = (newLog) => {
    setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 100)); // Cap at 100 logs
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const activeRoute = routes.find(r => r.id === selectedRouteId) || null;

  // Code Exporters
  const generateExpressCode = (route) => {
    // Generate simple Node/Express.js script with mock templates
    const NAMES = ["John Doe", "Jane Smith", "Alex Rivera", "Emily Chen", "Michael Scott", "Sarah Connor", "Bruce Wayne", "Clark Kent", "Diana Prince", "Peter Parker"];
    const CITIES = ["New York", "San Francisco", "London", "Tokyo", "Paris", "Berlin"];
    const COMPANIES = ["Acme Corp", "Globex", "Initech", "Umbrella Corp", "Cyberdyne"];

    const routeExpressText = `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mock Engine Helper
const NAMES = ${JSON.stringify(NAMES)};
const CITIES = ${JSON.stringify(CITIES)};
const COMPANIES = ${JSON.stringify(COMPANIES)};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function interpolateString(str, index = 1, context = {}) {
  if (typeof str !== 'string') return str;
  return str.replace(/\\{\\{([\\w\\.]+)\\}\\}/g, (match, token) => {
    const parts = token.split('.');
    if (parts.length > 1) {
      const [scope, key] = parts;
      const target = context[scope.toLowerCase()];
      if (target && target[key] !== undefined) return target[key].toString();
      return match;
    }
    switch (token.toLowerCase()) {
      case 'id': return 'uuid-' + Math.random().toString(36).substr(2, 9);
      case 'index': return index.toString();
      case 'name': return getRandomElement(NAMES);
      case 'email': return getRandomElement(NAMES).toLowerCase().replace(/\\s+/g, '.') + '@example.com';
      case 'city': return getRandomElement(CITIES);
      case 'company': return getRandomElement(COMPANIES);
      case 'date': return new Date().toISOString();
      case 'boolean': return (Math.random() > 0.5).toString();
      case 'number': return Math.floor(Math.random() * 100 + 1).toString();
      default: return match;
    }
  });
}

function parseMockTemplate(templateObj, index = 1, context = {}) {
  if (templateObj === null) return null;
  if (Array.isArray(templateObj)) {
    return templateObj.map((item, idx) => parseMockTemplate(item, idx + 1, context));
  }
  if (typeof templateObj === 'object') {
    const result = {};
    for (const key in templateObj) {
      const match = key.match(/^(.+)\\|(\\d+)(?:-(\\d+))?$/);
      if (match) {
        const baseKey = match[1];
        const min = parseInt(match[2], 10);
        const max = match[3] ? parseInt(match[3], 10) : min;
        const count = min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;
        result[baseKey] = Array.from({ length: count }, (_, idx) => parseMockTemplate(templateObj[key], idx + 1, context));
      } else {
        result[key] = parseMockTemplate(templateObj[key], index, context);
      }
    }
    return result;
  }
  if (typeof templateObj === 'string') {
    const exactToken = templateObj.match(/^\\{\\{([\\w\\.]+)\\}\\}/);
    if (exactToken && exactToken[0] === templateObj) {
      const val = interpolateString(templateObj, index, context);
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (/^\\d+$/.test(val)) return Number(val);
      return val;
    }
    return interpolateString(templateObj, index, context);
  }
  return templateObj;
}

// Mock Endpoint implementation
app.${route.method.toLowerCase()}('${route.path}', (req, res) => {
  // Set headers
  ${(route.headers || []).map(h => `res.setHeader('${h.key}', '${h.value}');`).join('\n  ')}
  
  const context = {
    query: req.query,
    body: req.body,
    params: req.params
  };

  const responseBody = parseMockTemplate(${JSON.stringify(route.body, null, 2).replace(/\n/g, '\n  ')}, 1, context);

  // Latency delay simulation
  setTimeout(() => {
    res.status(${route.status}).json(responseBody);
  }, ${route.latency});
});

app.listen(PORT, () => {
  console.log(\`Mock Express Server running on port \${PORT}\`);
  console.log(\`Test endpoint: http://localhost:\${PORT}${route.path}\`);
});
`;
    setModalContent({
      title: `Express.js Mock Script for ${route.method} ${route.path}`,
      code: routeExpressText
    });
  };

  const generateOpenAPISpec = (route) => {
    // Generate simple OpenAPI v3 YAML-like JSON document
    const spec = {
      openapi: "3.0.0",
      info: {
        title: "Mock API Spec",
        version: "1.0.0",
        description: "Generated by Visual Mock API Client"
      },
      paths: {
        [route.path]: {
          [route.method.toLowerCase()]: {
            summary: `Mocked endpoint returning dynamically populated payload`,
            parameters: [
              {
                name: "userId",
                in: "query",
                description: "Simulated query ID parameter",
                required: false,
                schema: { type: "string" }
              }
            ],
            responses: {
              [route.status]: {
                description: `Dynamic simulated response body`,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      example: route.body
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    setModalContent({
      title: `OpenAPI 3.0 Specification for ${route.path}`,
      code: JSON.stringify(spec, null, 2)
    });
  };

  const copyToClipboard = () => {
    if (!modalContent) return;
    navigator.clipboard.writeText(modalContent.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-container">
      {/* Top Header Navigation */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">M</div>
          <h1 className="logo-text" id="app-title">MockAPI Studio</h1>
          <span className="badge badge-get" style={{ fontSize: '10px', padding: '1px 6px', fontWeight: '500' }}>
            Client-Side Sandbox
          </span>
        </div>
        <div className="header-actions">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            Documentation
          </a>
        </div>
      </header>

      {/* Main Workspace Workspace */}
      <main className="app-workspace">
        {/* Column 1: Endpoint List / Sidebar */}
        <Sidebar
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={handleSelectRoute}
          onCreateRoute={handleCreateRoute}
          onDeleteRoute={handleDeleteRoute}
          onImportConfig={handleImportConfig}
          onExportConfig={handleExportConfig}
          onClearAll={handleClearAll}
        />

        {/* Column 2: Endpoint Schema Config Editor */}
        <RouteEditor
          route={activeRoute}
          onChangeRoute={handleChangeRoute}
          onExportExpress={generateExpressCode}
          onExportOpenAPI={generateOpenAPISpec}
        />

        {/* Column 3: Response Tester & Timeline Log */}
        <div style={{ display: 'grid', gridTemplateRows: '1.2fr 0.8fr', height: '100%', overflow: 'hidden' }}>
          <RequestTester
            route={activeRoute}
            onLogRequest={handleLogRequest}
          />
          <LogsTimeline
            logs={logs}
            onClearLogs={handleClearLogs}
          />
        </div>
      </main>

      {/* Exporter Dialog Modal */}
      {modalContent && (
        <div className="modal-overlay" onClick={() => setModalContent(null)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modalContent.title}</span>
              <button className="modal-close-btn" onClick={() => setModalContent(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="test-section-title" style={{ margin: 0 }}>Generated Source Code</span>
                <button 
                  className={`btn ${copied ? 'btn-primary' : 'btn-secondary'} btn-sm`} 
                  onClick={copyToClipboard}
                  style={{ minWidth: '80px' }}
                >
                  {copied ? '✓ Copied' : 'Copy Code'}
                </button>
              </div>
              <div className="code-editor-wrapper" style={{ background: '#f7f3e8' }}>
                <textarea
                  className="code-textarea"
                  readOnly
                  style={{ height: '350px', cursor: 'text', color: '#384246' }}
                  value={modalContent.code}
                  onClick={(e) => e.target.select()}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalContent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
