import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

/**
 * Returns a singleton Echo instance bound to the given token.
 * Call destroyEcho() first if the token has changed (i.e. on logout/re-login).
 */
export function getEcho(token) {
    if (echoInstance) return echoInstance;

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
        wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
        wssPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '443'),
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: 'http://127.0.0.1:8000/broadcasting/auth',
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    });

    return echoInstance;
}

/** Cleanly disconnect and discard the Echo instance (call on logout) */
export function destroyEcho() {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}