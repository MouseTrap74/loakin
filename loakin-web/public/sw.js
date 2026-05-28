/* Loakin Service Worker — handles Web Push notifications */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('push', (event) => {
    let data = {};
    try { data = event.data?.json() ?? {}; } catch (_) {}

    const title = data.title ?? 'Loakin';
    const options = {
        body:      data.body   ?? 'Ada notifikasi baru untuk kamu.',
        icon:      '/icon-192.png',
        badge:     '/icon-72.png',
        data:      { url: data.url ?? '/' },
        tag:       data.tag    ?? 'loakin-notification',
        renotify:  true,
        vibrate:   [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Reuse an open tab if it's already on the right URL
            for (const client of windowClients) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new tab
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});