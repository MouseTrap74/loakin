/* Loakin Service Worker — Web Push notifications */
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(clients.claim()));

self.addEventListener('push', (event) => {
    let data = {};
    try { data = event.data?.json() ?? {}; } catch (_) {}

    const title   = data.title ?? 'Loakin';
    const options = {
        body:     data.body  ?? 'Ada notifikasi baru untuk kamu.',
        icon:     '/icon-192.png',
        badge:    '/icon-72.png',
        data:     { url: data.url ?? '/' },
        tag:      data.tag   ?? 'loakin-notif',
        renotify: true,
        vibrate:  [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            for (const client of list) {
                if (client.url.includes(url) && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});