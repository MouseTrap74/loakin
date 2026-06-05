import { useEffect } from 'react';
import api from '../services/api';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw     = window.atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

/**
 * Registers the service worker and subscribes to Web Push when the user is logged in.
 * Silently skips if the browser doesn't support it.
 * Flutter bypasses this entirely — it calls POST /push/fcm-token instead.
 */
export function usePushNotifications(loggedIn) {
    useEffect(() => {
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        if (
            !loggedIn ||
            !vapidKey ||
            !('serviceWorker' in navigator) ||
            !('PushManager' in window)
        ) return;

        async function register() {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                await navigator.serviceWorker.ready;

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                // Reuse existing subscription to avoid duplicate DB entries
                let sub = await reg.pushManager.getSubscription();
                if (!sub) {
                    sub = await reg.pushManager.subscribe({
                        userVisibleOnly:      true,
                        applicationServerKey: urlBase64ToUint8Array(vapidKey),
                    });
                }

                const json = sub.toJSON();
                await api.post('/push/subscribe', {
                    endpoint:    json.endpoint,
                    p256dh:      json.keys.p256dh,
                    auth_token:  json.keys.auth,
                    device_type: 'web',
                });
            } catch (err) {
                // Non-fatal — push is progressive enhancement
                console.warn('[Push] Registration failed:', err);
            }
        }

        register();
    }, [loggedIn]);
}