/**
 * Shared Echo singleton — works with Vite (ESM).
 *
 * Both NotificationContext and ChatContext import { getEchoAsync, destroyEcho }
 * from this file so only ONE WebSocket connection is created per session.
 */

let echoInstance = null;
let echoPromise  = null;   // avoids double-init race

/**
 * Return a ready Echo instance (async, lazy).
 * Resolves to `null` when Reverb is not configured or packages are missing.
 */
export async function getEchoAsync(token) {
    // Already initialised
    if (echoInstance) return echoInstance;

    // Another call is already in-flight — wait for it
    if (echoPromise) return echoPromise;

    echoPromise = (async () => {
        try {
            const key = import.meta.env.VITE_REVERB_APP_KEY;
            if (!key) {
                console.warn('[Echo] VITE_REVERB_APP_KEY not set — real-time disabled.');
                return null;
            }

            const [{ default: Echo }, { default: Pusher }] = await Promise.all([
                import('laravel-echo'),
                import('pusher-js'),
            ]);
            window.Pusher = Pusher;

            const API_BASE_URL =
                (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

            echoInstance = new Echo({
                broadcaster:       'reverb',
                key,
                wsHost:            import.meta.env.VITE_REVERB_HOST  ?? 'localhost',
                wsPort:            parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
                wssPort:           parseInt(import.meta.env.VITE_REVERB_PORT ?? '443'),
                forceTLS:          (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
                enabledTransports: ['ws', 'wss'],
                authEndpoint:      `${API_BASE_URL}/broadcasting/auth`,
                auth: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept:        'application/json',
                    },
                },
            });

            return echoInstance;
        } catch (err) {
            console.warn('[Echo] Could not load real-time client:', err.message);
            return null;
        } finally {
            echoPromise = null;
        }
    })();

    return echoPromise;
}

/**
 * Synchronous getter — returns the instance if it's already initialised, else null.
 * Use this only when you KNOW getEchoAsync was already called & resolved.
 */
export function getEcho() {
    return echoInstance;
}

/**
 * Tear down the WebSocket connection.
 */
export function destroyEcho() {
    if (echoInstance) {
        try { echoInstance.disconnect(); } catch (_) {}
        echoInstance = null;
    }
}