/**
 * Database&Caching/serviceWorker/server.js
 *
 * Local Express server to run the Service Worker playground.
 * Running commands:
 * 1. cd Database&Caching/serviceWorker
 * 2. npm install express
 * 3. node server.js
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001; // Runs on port 3001 to avoid collision with caching playground

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[SW SERVER] ${req.method} ${req.path}`);
  next();
});

// Explicit header override for the service worker script (sw.js).
// Prevents the browser from caching the sw.js script, avoiding update lockups.
app.use('/sw.js', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static assets (HTML, CSS, JS client files)
app.use(express.static(__dirname));

// Dynamic API Endpoint: Returns server-rendered timestamp
app.get('/api/time', (req, res) => {
  res.json({
    timestamp: new Date().toLocaleTimeString(),
    epoch: Date.now(),
    message: 'Dynamic payload fetched fresh from the origin server!',
  });
});

app.listen(PORT, () => {
  console.log(`\n\x1b[1m\x1b[32m✔ Service Worker Playground Server running at http://localhost:${PORT}\x1b[0m`);
});
