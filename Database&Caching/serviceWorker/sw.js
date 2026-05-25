/**
 * Database&Caching/serviceWorker/sw.js
 *
 * Service Worker background script implementing pre-caching, active revalidation,
 * dynamic cache strategy switching, and simulated server outages.
 */

const CACHE_NAME = 'sw-playground-v1';
const PRECACHE_ASSETS = ['/', '/index.html', '/styles.css', '/app.js', '/image.png'];

let currentStrategy = 'cache-first';
let simulateOffline = false;

// 1. INSTALL EVENT: Pre-cache static playground assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event fired. Caching assets...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] All core assets cached. Activating immediately.');
        return self.skipWaiting();
      }),
  );
});

// 2. ACTIVATE EVENT: Clean up older worker caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event fired. Purging older caches...');
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Removing stale cache store:', key);
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => {
        console.log('[SW] Ready to intercept requests.');
        return self.clients.claim();
      }),
  );
});

// 3. MESSAGE EVENT: Handle thread control messages from the page context
self.addEventListener('message', (event) => {
  const data = event.data;
  console.log('[SW] Message received from page context:', data);

  if (data.type === 'SET_STRATEGY') {
    currentStrategy = data.strategy;
    console.log('[SW] Strategy updated dynamically to:', currentStrategy);
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true, strategy: currentStrategy });
    }
  } else if (data.type === 'SET_OFFLINE') {
    simulateOffline = data.offline;
    console.log('[SW] Offline simulation mode toggled:', simulateOffline);
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true, offline: simulateOffline });
    }
  } else if (data.type === 'GET_STATUS') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ strategy: currentStrategy, offline: simulateOffline });
    }
  }
});

// 4. FETCH EVENT: Intercept incoming requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Restrict interception to same-origin requests (ignore external analytics, fonts, CDNs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Bypass interception for administrative endpoints (sw.js itself)
  if (url.pathname === '/sw.js') {
    return;
  }

  console.log(
    `[SW Fetch] ${event.request.method} ${url.pathname} (Strategy: ${currentStrategy}, Outage: ${simulateOffline})`,
  );

  // A. Outage simulation mode: serve from cache if possible, otherwise block and fail
  if (simulateOffline) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`[SW Fetch] Outage active: Cache HIT for ${url.pathname}`);
          const headers = new Headers(cachedResponse.headers);
          headers.set('X-Response-Source', 'Service Worker Cache (Offline Outage)');
          headers.set('X-SW-Strategy', currentStrategy);
          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers,
          });
        }

        console.log(`[SW Fetch] Outage active: Cache MISS for ${url.pathname}. Blocking network.`);
        return new Response(
          JSON.stringify({ error: 'Simulated Server Outage: Cache missed and network calls are blocked.' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json', 'X-Response-Source': 'Service Worker Block' },
          },
        );
      }),
    );
    return;
  }

  // B. Standard Mode: apply the currently selected caching strategy
  if (currentStrategy === 'cache-first') {
    event.respondWith(handleCacheFirst(event.request));
  } else if (currentStrategy === 'network-first') {
    event.respondWith(handleNetworkFirst(event.request));
  } else if (currentStrategy === 'stale-while-revalidate') {
    event.respondWith(handleStaleWhileRevalidate(event.request));
  }
});

// Strategy 1: Cache-First (falling back to network)
function handleCacheFirst(request) {
  return caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
    if (cachedResponse) {
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Response-Source', 'Service Worker Cache (Cache-First Hit)');
      headers.set('X-SW-Strategy', 'cache-first');
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      });
    }

    return fetch(request).then((networkResponse) => {
      if (!networkResponse || networkResponse.status !== 200) {
        return networkResponse;
      }

      const responseClone = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });

      const headers = new Headers(networkResponse.headers);
      headers.set('X-Response-Source', 'Origin Server Network (Cache-First Miss)');
      headers.set('X-SW-Strategy', 'cache-first');
      return new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers,
      });
    });
  });
}

// Strategy 2: Network-First (falling back to cache)
function handleNetworkFirst(request) {
  return fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        const headers = new Headers(networkResponse.headers);
        headers.set('X-Response-Source', 'Origin Server Network (Network-First Hit)');
        headers.set('X-SW-Strategy', 'network-first');
        return new Response(networkResponse.body, {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers,
        });
      }
      return serveFromCacheFallback(request, 'network-first');
    })
    .catch(() => {
      return serveFromCacheFallback(request, 'network-first');
    });
}

// Strategy 3: Stale-While-Revalidate (SWR)
function handleStaleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then((cache) => {
    return cache.match(request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      });

      if (cachedResponse) {
        const headers = new Headers(cachedResponse.headers);
        headers.set('X-Response-Source', 'Service Worker Cache (Stale-While-Revalidate)');
        headers.set('X-SW-Strategy', 'stale-while-revalidate');
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers,
        });
      }

      return fetchPromise.then((networkResponse) => {
        const headers = new Headers(networkResponse.headers);
        headers.set('X-Response-Source', 'Origin Server Network (SWR Cache Miss)');
        headers.set('X-SW-Strategy', 'stale-while-revalidate');
        return new Response(networkResponse.body, {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers,
        });
      });
    });
  });
}

// Fallback Cache Resolver
function serveFromCacheFallback(request, strategy) {
  return caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
    if (cachedResponse) {
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Response-Source', 'Service Worker Cache (Network Outage Fallback)');
      headers.set('X-SW-Strategy', strategy);
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      });
    }

    return new Response(JSON.stringify({ error: 'Network failed, and no cached copy is available.' }), {
      status: 504,
      headers: { 'Content-Type': 'application/json', 'X-Response-Source': 'Service Worker Error' },
    });
  });
}
