/**
 * Database&Caching/serviceWorker/app.js
 *
 * Client script managing registration status, thread message passing,
 * triggering network calls, and appending metrics to the log monitor.
 */

let requestCount = 0;

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
  updateStatusUI();

  // Listen for changes in Service Worker controller state
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[Client app.js] Controller changed. New Service Worker active.');
      updateStatusUI();
      syncSettingsWithWorker();
    });

    // Initial status check
    navigator.serviceWorker.ready.then(() => {
      updateStatusUI();
      syncSettingsWithWorker();
    });
  }
});

// 1. Service Worker Thread Control API
async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    alert('Service Workers are not supported in this browser.');
    return;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[Client app.js] Registration successful. Scope:', reg.scope);
    updateStatusUI();

    // Check if controller is immediately available, otherwise wait
    if (navigator.serviceWorker.controller) {
      syncSettingsWithWorker();
    }
  } catch (error) {
    console.error('[Client app.js] Registration failed:', error);
    alert('Failed to register service worker. See console logs.');
  }
}

async function unregisterSW() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
      console.log('[Client app.js] Unregistered Service Worker scope:', registration.scope);
    }
    updateStatusUI();
    location.reload(); // Reload page to release interception loops
  } catch (error) {
    console.error('[Client app.js] Unregistration failed:', error);
  }
}

// 2. Thread Messaging & Sync APIs
function sendMessageToWorker(message) {
  return new Promise((resolve) => {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
      resolve({ error: 'No active service worker controller' });
      return;
    }

    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    navigator.serviceWorker.controller.postMessage(message, [channel.port2]);
  });
}

async function updateStrategy() {
  const strategy = document.getElementById('strategy-select').value;
  console.log('[Client app.js] Directing worker to change strategy to:', strategy);
  const response = await sendMessageToWorker({ type: 'SET_STRATEGY', strategy });

  if (response.success) {
    renderStrategyBadge(strategy);
    updateExplanationCard(strategy, document.getElementById('offline-toggle').checked);
  }
}

async function toggleOffline() {
  const offline = document.getElementById('offline-toggle').checked;
  console.log('[Client app.js] Directing worker to set simulated outage mode to:', offline);
  const response = await sendMessageToWorker({ type: 'SET_OFFLINE', offline });

  if (response.success) {
    const banner = document.getElementById('outage-banner');
    if (offline) {
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
    updateExplanationCard(document.getElementById('strategy-select').value, offline);
  }
}

async function syncSettingsWithWorker() {
  // Sync the current selection to the newly loaded worker
  const strategy = document.getElementById('strategy-select').value;
  const offline = document.getElementById('offline-toggle').checked;

  await sendMessageToWorker({ type: 'SET_STRATEGY', strategy });
  await sendMessageToWorker({ type: 'SET_OFFLINE', offline });

  renderStrategyBadge(strategy);
}

// 3. Asset Loading Interceptions
async function loadAsset(url, assetName) {
  const timestamp = new Date().toLocaleTimeString();
  const start = performance.now();
  let response;
  let errorOccurred = false;

  try {
    // Append query salt to dynamically bypass standard HTTP Cache and force interaction with Service Worker
    const saltUrl = url + (url.includes('?') ? '&' : '?') + 'r=' + Math.random().toString(36).substring(7);
    response = await fetch(saltUrl);
  } catch (err) {
    errorOccurred = true;
    console.error(err);
  }

  const latency = Math.round(performance.now() - start);

  if (errorOccurred || !response) {
    appendLogEntry({
      timestamp,
      assetName,
      url,
      status: 'ERR',
      source: 'Failed (Network Error)',
      sourceClass: 'hit-network',
      latency,
      size: '-',
    });
    return;
  }

  // Read response contents to trigger body consumption
  let text = '';
  try {
    text = await response.text();
  } catch (e) {}

  const size = new Blob([text]).size;

  // Extract custom headers set by Service Worker to determine exact delivery path
  const sourceHeader = response.headers.get('X-Response-Source') || 'Network Direct (Bypassed SW)';
  const strategyUsed = response.headers.get('X-SW-Strategy') || 'None';

  let sourceClass = 'hit-network';
  if (sourceHeader.includes('Cache')) {
    sourceClass = 'hit-cache';
  } else if (sourceHeader.includes('Outage')) {
    sourceClass = 'hit-validation';
  }

  appendLogEntry({
    timestamp,
    assetName,
    url,
    status: response.status,
    source: sourceHeader,
    sourceClass,
    latency,
    size: response.status === 200 ? `${size} B` : '-',
  });

  // Render the timing/header details in the inspector block
  renderInspectorDetails(assetName, url, response.status, sourceHeader, strategyUsed, text, response.headers);
}

// 4. UI Rendering Functions
function updateStatusUI() {
  const statusIndicator = document.getElementById('sw-status-indicator');
  const statusText = document.getElementById('sw-status-text');
  const regBtn = document.getElementById('reg-btn');
  const unregBtn = document.getElementById('unreg-btn');

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    statusIndicator.className = 'status-dot dot-active';
    statusText.innerText =
      'Active & Intercepting (' + navigator.serviceWorker.controller.scriptURL.split('/').pop() + ')';
    regBtn.style.display = 'none';
    unregBtn.style.display = 'inline-flex';
  } else {
    statusIndicator.className = 'status-dot dot-inactive';
    statusText.innerText = 'Inactive (Not registered or waiting)';
    regBtn.style.display = 'inline-flex';
    unregBtn.style.display = 'none';
  }
}

function renderStrategyBadge(strategy) {
  const badge = document.getElementById('active-strategy-badge');
  badge.innerText = strategy.toUpperCase();
}

function appendLogEntry(item) {
  const logsBody = document.getElementById('logs-body');
  requestCount++;

  // Clear initial empty placeholder row on first log
  if (requestCount === 1) {
    logsBody.innerHTML = '';
  }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="font-mono" style="color: var(--text-muted);">${item.timestamp}</td>
    <td><strong>${item.assetName}</strong><br/><span style="font-size:0.75rem; color: var(--text-muted);">${item.url}</span></td>
    <td><span class="status-badge badge-${item.status === 200 ? '200' : '304'}">${item.status}</span></td>
    <td><span class="hit-source ${item.sourceClass}">${item.source}</span></td>
    <td class="font-mono">${item.latency}ms</td>
    <td class="font-mono">${item.size}</td>
  `;

  logsBody.insertBefore(row, logsBody.firstChild);
}

function renderInspectorDetails(name, url, status, source, strategy, content, headers) {
  const inspector = document.getElementById('inspector-output');

  let headersObj = {};
  for (let [key, value] of headers.entries()) {
    headersObj[key] = value;
  }

  inspector.innerHTML = `
    <div class="explain-title">⚙️ Request Traced: ${name}</div>
    <div style="margin-top: 0.5rem; font-size: 0.85rem;">
      <p><strong>Request URL:</strong> <code>${url}</code></p>
      <p><strong>Response Status:</strong> <span class="status-badge badge-200">${status}</span></p>
      <p><strong>Interception Path:</strong> <span style="color: var(--primary); font-weight:600;">${source}</span></p>
      <p><strong>SW Strategy Selected:</strong> <code>${strategy}</code></p>
    </div>
    <div style="margin-top:0.75rem; font-weight:600; font-size:0.8rem; color: var(--text-muted);">Payload Content (Preview):</div>
    <div class="headers-inspect" style="color: #61afef; border-color: rgba(48,54,61,0.4); max-height: 50px; margin-bottom: 0.5rem;">${content.substring(0, 150)}...</div>
    <div style="font-weight:600; font-size:0.8rem; color: var(--text-muted);">Response Headers:</div>
    <pre class="headers-inspect">${JSON.stringify(headersObj, null, 2)}</pre>
  `;
}

function updateExplanationCard(strategy, offline) {
  const explanation = document.getElementById('strategy-explanation');

  if (offline) {
    explanation.innerHTML = `
      <p style="color: var(--danger); font-weight:600;">⚠️ Simulated Server Outage (Offline Mode) is Active!</p>
      <p style="margin-top:0.25rem; font-size:0.85rem; color: var(--text-muted);">
        The Service Worker is preventing all outgoing requests from hitting the network.
        Assets that are already cached will load successfully from Cache storage.
        Assets that are not cached will return a custom 503 error handled locally by the Service Worker, demonstrating offline resilience failure boundaries.
      </p>
    `;
    return;
  }

  if (strategy === 'cache-first') {
    explanation.innerHTML = `
      <p><strong>Active Strategy: Cache-First (Offline Optimization)</strong></p>
      <p style="margin-top:0.25rem; font-size:0.85rem; color: var(--text-muted);">
        The Service Worker queries the local Cache first. On a Cache Hit, it returns the resource immediately (latency is typically 0-3ms).
        On a Cache Miss, it downloads the resource from the network, writes it to the Cache, and returns it. Perfect for static assets like styles, scripts, and logos.
      </p>
    `;
  } else if (strategy === 'network-first') {
    explanation.innerHTML = `
      <p><strong>Active Strategy: Network-First (Freshness Optimization)</strong></p>
      <p style="margin-top:0.25rem; font-size:0.85rem; color: var(--text-muted);">
        The Service Worker attempts to fetch the resource from the server network first. On success, it writes it to the Cache.
        If the network fails or is offline, it immediately serves the latest cached copy. Ideal for dynamic data where freshness is vital.
      </p>
    `;
  } else if (strategy === 'stale-while-revalidate') {
    explanation.innerHTML = `
      <p><strong>Active Strategy: Stale-While-Revalidate (Speed & Freshness Hybrid)</strong></p>
      <p style="margin-top:0.25rem; font-size:0.85rem; color: var(--text-muted);">
        Serves the cached copy immediately for extreme load speeds. In the background, it dispatches an asynchronous network fetch
        to obtain the fresh copy and update the cache for the next request. Excellent for news feeds, avatars, and regularly updated content.
      </p>
    `;
  }
}

function clearLogs() {
  const logsBody = document.getElementById('logs-body');
  logsBody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem">No requests intercepted yet. Click an asset fetch button above to trace requests.</td>
    </tr>
  `;
  requestCount = 0;
}
