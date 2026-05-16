/**
 * Service Worker — rzdkstore PWA
 *
 * Handles:
 * - Push notification display
 * - Notification click → navigate to URL
 * - Basic offline caching (app shell)
 */

const CACHE_NAME = 'rzdkstore-v1';

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/offline.html']);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Push: display notification
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const { title, body, icon, badge, data, tag } = payload;

  const options = {
    body: body || '',
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/icon-192x192.png',
    data: data || { url: '/dashboard/notifikasi' },
    tag: tag || 'rzdkstore-notification',
    vibrate: [200, 100, 200],
    actions: [{ action: 'open', title: 'Buka' }],
  };

  event.waitUntil(self.registration.showNotification(title || 'rzdkstore', options));
});

// Notification click: navigate to URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/dashboard/notifikasi';
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If already open, focus it
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(fullUrl);
    })
  );
});

// Fetch: basic network-first with offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls and non-same-origin
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((cached) => {
        return cached || caches.match('/offline.html');
      });
    })
  );
});
