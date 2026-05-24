/**
 * Database&Caching/httpCaching/server.js
 *
 * An Express.js-based caching simulation server illustrating:
 * 1. How to serve static files with and without caching headers using express.static.
 * 2. How to programmatically strip or remove HTTP caching headers from responses.
 * 3. Freshness (Cache-Control directives) and Validation (ETag/Last-Modified handshakes).
 *
 * How to Run:
 * 1. Navigate to directory: cd Database&Caching/httpCaching
 * 2. Install Express: npm install express
 * 3. Run with Node: node server.js
 * 4. Run with Nodemon (for live reload): npx nodemon server.js
 */

const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Dynamic simulation state variables
let etagVersion = 1;
let lastModifiedTime = new Date(Date.now() - 60000 * 5); // 5 minutes ago

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[EXPRESS REQUEST] ${req.method} ${req.path}`);
  if (req.headers['if-none-match']) {
    console.log(`  -> If-None-Match: ${req.headers['if-none-match']}`);
  }
  if (req.headers['if-modified-since']) {
    console.log(`  -> If-Modified-Since: ${req.headers['if-modified-since']}`);
  }
  next();
});

// ==========================================
// 1. Serving Static Assets with Caching Disabled (User Request Options)
// ==========================================
// Disables ETag, Cache-Control, and Last-Modified headers in static files
app.use(
  '/static-no-cache',
  express.static(path.join(__dirname, 'static'), {
    etag: false, // Disables ETag generation (removes 'ETag' header)
    cacheControl: false, // Disables default Cache-Control (removes 'Cache-Control' header)
    lastModified: false, // Disables Last-Modified (removes 'Last-Modified' header)
  }),
);

// ==========================================
// 2. Serving Caching Simulation Assets
// ==========================================

// Serve index.html dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API: Modify assets dynamically on server
app.get('/api/modify-assets', (req, res) => {
  etagVersion += 1;
  lastModifiedTime = new Date();
  res.json({
    success: true,
    version: etagVersion,
    lastModified: lastModifiedTime.toUTCString(),
  });
});

// A. Immutable Asset route
app.get('/static/immutable.js', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(
    `console.log("Loaded immutable asset. Version: hash-999a8b");\nwindow.immutableLoadedAt = "${new Date().toLocaleTimeString()}";`,
  );
});

// B. No-Store Asset route
app.get('/static/no-store.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`console.log("Loaded no-store asset.");\nwindow.noStoreLoadedAt = "${new Date().toLocaleTimeString()}";`);
});

// C. ETag Validation route
app.get('/static/validation-etag.js', (req, res) => {
  const content = `console.log("Loaded ETag validation asset. Version: ${etagVersion}");\nwindow.etagLoadedAt = "${new Date().toLocaleTimeString()}";`;
  const etag = `"${crypto.createHash('sha1').update(content).digest('hex')}"`;

  // Server-Side ETag Check & Response Header Removal Options
  if (req.headers['if-none-match'] === etag) {
    res.status(304);
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'no-cache');
    res.end();
  } else {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('ETag', etag);
    res.setHeader('Content-Type', 'application/javascript');
    res.send(content);
  }
});

// D. Last-Modified Validation route
app.get('/static/validation-lastmod.js', (req, res) => {
  const content = `console.log("Loaded Last-Modified asset. Time: ${lastModifiedTime.toLocaleTimeString()}");\nwindow.lastmodLoadedAt = "${new Date().toLocaleTimeString()}";`;
  const lastModifiedStr = lastModifiedTime.toUTCString();

  const ifModifiedSince = req.headers['if-modified-since'];
  if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModifiedStr)) {
    res.status(304);
    res.setHeader('Last-Modified', lastModifiedStr);
    res.setHeader('Cache-Control', 'no-cache');
    res.end();
  } else {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Last-Modified', lastModifiedStr);
    res.setHeader('Content-Type', 'application/javascript');
    res.send(content);
  }
});

// E. Stale-While-Revalidate route
app.get('/static/swr.js', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=5');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(
    `console.log("Loaded SWR asset. Timestamp: ${new Date().toLocaleTimeString()}");\nwindow.swrLoadedAt = "${new Date().toLocaleTimeString()}";`,
  );
});

// G. Expires route (Legacy HTTP/1.0 Absolute TTL)
app.get('/static/expires.js', (req, res) => {
  // Set Expires header to exactly 24 hours in the future
  const oneDayFuture = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  res.setHeader('Expires', oneDayFuture);
  res.setHeader('Content-Type', 'application/javascript');
  res.send(
    `console.log("Loaded legacy Expires asset.");\nwindow.expiresLoadedAt = "${new Date().toLocaleTimeString()}";`,
  );
});

// H. Private Cache route (Browser-only, no intermediate/CDN caching)
app.get('/static/private.js', (req, res) => {
  res.setHeader('Cache-Control', 'private, max-age=60');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(
    `console.log("Loaded private scope asset.");\nwindow.privateLoadedAt = "${new Date().toLocaleTimeString()}";`,
  );
});

// I. Proxy Revalidate route (Shared cache revalidation force)
app.get('/static/proxy-revalidate.js', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=10, proxy-revalidate');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(
    `console.log("Loaded proxy-revalidate asset.");\nwindow.proxyRevalidateLoadedAt = "${new Date().toLocaleTimeString()}";`,
  );
});

// J. Stale-If-Error route (Error resilience fallback)
app.get('/static/stale-if-error.js', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=5, stale-if-error=30');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(
    `console.log("Loaded stale-if-error asset. Timestamp: ${new Date().toLocaleTimeString()}");\nwindow.staleIfErrorLoadedAt = "${new Date().toLocaleTimeString()}";`,
  );
});

// K. No-Transform route (CDN/Proxy payload integrity protection)
app.get('/static/no-transform.js', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, no-transform');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(
    `console.log("Loaded no-transform asset. Payload remains unmodified by edge proxies.");\nwindow.noTransformLoadedAt = "${new Date().toLocaleTimeString()}";`,
  );
});

// F. Image serve route (First time network, second time cache hit)
app.get('/static/cache_shield.png', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.sendFile(path.join(__dirname, 'static', 'cache_shield.png'));
});

// ==========================================
// 3. Header Stripping/Removal Middleware Example
// ==========================================
// Programmatically stripping caching headers on dynamic routes
app.get('/api/raw-data', (req, res) => {
  res.removeHeader('Cache-Control'); // Strips Cache-Control header
  res.removeHeader('ETag'); // Strips ETag signature
  res.removeHeader('Last-Modified'); // Strips Last-Modified timestamp
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json({ message: 'Caches explicitly bypassed!' });
});

// Start Express caching server with ANSI escape console styling:
// - '\n'       : Newline spacing
// - '\x1b[1m'  : Sets terminal text to Bold
// - '\x1b[32m' : Sets terminal text to Green
// - '\x1b[0m'  : Resets formatting (prevents style bleed to subsequent console lines)
app.listen(PORT, () => {
  console.log(`\n\x1b[1m\x1b[32m✔ Express Caching Server running at http://localhost:${PORT}\x1b[0m`);
});
