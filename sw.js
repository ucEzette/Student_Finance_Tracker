/**
 * Service Worker for Student Finance Tracker
 * Provides offline-first functionality with caching strategies
 */

const CACHE_NAME = 'finance-tracker-v1.0.0';
const CACHE_STATIC_NAME = 'finance-tracker-static-v1.0.0';
const CACHE_DYNAMIC_NAME = 'finance-tracker-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/main.css',
    '/main.js',
    '/storage.js',
    '/state.js',
    '/ui.js',
    '/validators.js',
    '/search.js',
    '/stats.js',
    '/seed.json',
    '/tests.html',
    '/scraper.html',
    '/manifest.json'
];

// Dynamic content patterns
const DYNAMIC_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\.(?:woff|woff2|ttf|eot)$/,
    /\.(?:json)$/
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then((cache) => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_STATIC_NAME && 
                            cacheName !== CACHE_DYNAMIC_NAME &&
                            cacheName.startsWith('finance-tracker-')) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content with fallback strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(
        handleFetchRequest(request)
    );
});

async function handleFetchRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache first for static files
        if (isStaticFile(url.pathname)) {
            return await cacheFirst(request);
        }
        
        // Strategy 2: Network first for dynamic content
        if (isDynamicFile(url.pathname)) {
            return await networkFirst(request);
        }
        
        // Strategy 3: Stale while revalidate for HTML pages
        if (request.destination === 'document') {
            return await staleWhileRevalidate(request);
        }
        
        // Default: Network first with cache fallback
        return await networkFirst(request);
        
    } catch (error) {
        console.error('[SW] Fetch error:', error);
        
        // Return offline fallback for HTML requests
        if (request.destination === 'document') {
            return await getOfflineFallback();
        }
        
        throw error;
    }
}

// Cache first strategy - for static assets
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        console.log('[SW] Serving from cache:', request.url);
        return cachedResponse;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
        const cache = await caches.open(CACHE_STATIC_NAME);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Network first strategy - for dynamic content
async function networkFirst(request) {
    try {
        console.log('[SW] Network first:', request.url);
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(CACHE_DYNAMIC_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale while revalidate strategy - for HTML pages
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    // Fetch in background to update cache
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
            const cache = caches.open(CACHE_DYNAMIC_NAME);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    // Return cached version immediately if available
    if (cachedResponse) {
        console.log('[SW] Serving stale content:', request.url);
        return cachedResponse;
    }
    
    // Otherwise wait for network
    console.log('[SW] No cache, waiting for network:', request.url);
    return await fetchPromise;
}

// Get offline fallback page
async function getOfflineFallback() {
    const cache = await caches.open(CACHE_STATIC_NAME);
    return await cache.match('/index.html') || new Response(
        `<!DOCTYPE html>
        <html>
        <head><title>Offline - Finance Tracker</title></head>
        <body>
            <h1>You're Offline</h1>
            <p>The Finance Tracker is not available right now. Please check your connection.</p>
        </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
    );
}

// Helper functions
function isStaticFile(pathname) {
    return STATIC_FILES.includes(pathname) || 
           pathname.includes('/styles/') ||
           pathname.includes('/scripts/');
}

function isDynamicFile(pathname) {
    return DYNAMIC_PATTERNS.some(pattern => pattern.test(pathname));
}

// Background sync for data persistence
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-transactions') {
        event.waitUntil(syncTransactions());
    }
});

async function syncTransactions() {
    try {
        // This would sync with a server if we had one
        console.log('[SW] Syncing transactions (offline-only app)');
        
        // Notify clients that sync completed
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                data: { success: true }
            });
        });
        
    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    const options = {
        body: 'Your spending data has been updated',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'finance-update',
        requireInteraction: false,
        actions: [
            {
                action: 'view',
                title: 'View Dashboard',
                icon: '/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/action-dismiss.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Finance Tracker', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[SW] Service worker script loaded');
