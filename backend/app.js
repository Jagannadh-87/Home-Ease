const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Health check: app status + DB connection + timestamp (used by Docker healthcheck & Jenkins)
app.get('/api/health', (req, res) => {
  const up = mongoose.connection.readyState === 1;
  res.status(up ? 200 : 503).json({
    status: up ? 'UP' : 'DEGRADED',
    database: up ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Build Inspector: values are injected by Jenkins -> docker compose -> container env
app.get('/api/info', (req, res) => {
  const e = process.env;
  res.json({
    appName: e.APP_NAME || 'HomeEase',
    version: e.APP_VERSION || require('./package.json').version,
    gitCommit: e.GIT_COMMIT || 'local',
    buildNumber: e.BUILD_NUMBER || 'local',
    environment: e.DEPLOY_ENV || 'development',
    buildTimestamp: e.BUILD_TIMESTAMP || 'n/a',
    serverStatus: 'RUNNING',
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.use('/api', require('./routes'));
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message || 'Server error' }));

module.exports = app;
