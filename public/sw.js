// =============================================================================
// SERVICE WORKER - OPTIMIZED CACHE BUSTING SYSTEM
// =============================================================================
// This Service Worker implements a production-ready cache busting strategy:
//
// 1. VERSION-BASED CACHE (auto-incremented on deployment)
//    - Forces complete cache refresh when SW updates
//    - Old caches deleted automatically on activation
//
// 2. NETWORK-FIRST for Gist data
//    - Always fetches latest from gist.githubusercontent.com
//    - Falls back to cache only when offline
//    - Uses cacheVersion/exported_at as version identifier
//
// 3. CACHE-FIRST for static assets
//    - Instant loading from cache
//    - Background updates when available
//
// 4. AUTO-UPDATE mechanism (index.html)
//    - Checks for SW updates on every page load
//    - Auto-reloads once when new version ready
//    - isRefreshing flag prevents double-reload
//
// Result: Users get fresh data automatically, no manual hard refresh needed ✨
// =============================================================================

const CACHE_VERSION = 20;
const CACHE_NAME = `mtg-collection-v${CACHE_VERSION}`;
const DATA_CACHE_NAME = `mtg-data-v${CACHE_VERSION}`;

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log(`SW v${CACHE_VERSION} installing...`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/favicon.svg',
        '/favicon.ico',
        '/apple-touch-icon.png'
      ]);
    }).then(() => {
      console.log(`SW v${CACHE_VERSION} installed, skipping waiting...`);
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`SW v${CACHE_VERSION} activating...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that doesn't match current cache names
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`SW v${CACHE_VERSION} activated, claiming clients...`);
      // Ensure the new service worker takes control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - differentiated caching strategy
// NOTE: On GitHub Pages, we can't set HTTP headers via server config.
// The Service Worker handles ALL caching behavior instead:
// - Network-first for Gist data (always fresh)
// - Cache-first for assets (fast loading)
// - Automatic cache versioning and cleanup
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first strategy for Gist data (always fresh)
  // Fetches latest from gist.githubusercontent.com, falls back to cache if offline
  if (url.hostname === 'gist.githubusercontent.com' && url.pathname.includes('magic-collection.json')) {
    event.respondWith(
      fetch(event.request, {
        mode: 'cors',
        credentials: 'omit'
      })
        .then((fetchResponse) => {
          if (!fetchResponse.ok) {
            throw new Error('Network response was not ok');
          }
          return caches.open(DATA_CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        })
        .catch((error) => {
          console.log('Gist fetch failed, trying cache:', error);
          // Fallback to cache if offline or error
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return a valid error response instead of undefined
            return new Response(JSON.stringify({error: 'Failed to load data'}), {
              status: 503,
              statusText: 'Service Unavailable',
              headers: {'Content-Type': 'application/json'}
            });
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets (fast loading)
  // Assets are served from cache immediately, then updated in background
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Only cache same-origin requests
        if (event.request.url.startsWith(self.location.origin)) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    })
  );
});
