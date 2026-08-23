import { useEffect } from "react";
import {
    isPushSupported,
    registerServiceWorker,
    requestPermission,
    subscribeToPush,
} from "./pushNotifications";
import { getToken } from "./token";

/**
 * Automatically sets up push notifications after the user logs in.
 * Polls for the auth token since AppLayout mounts before the user is logged in.
 * Fails gracefully on unsupported platforms or if the user denies permission.
 */
export function usePushSetup() {
    useEffect(() => {
        if (!isPushSupported()) return;

        let disposed = false;

        const setup = async () => {
            const token = getToken();
            if (!token || disposed) return;

            // 1. Register service worker (idempotent — safe to call multiple times)
            const registration = await registerServiceWorker();
            if (!registration || disposed) return;

            // 2. Check existing permission
            if (Notification.permission === "granted") {
                await subscribeToPush(token);
                return;
            }

            if (Notification.permission === "denied") {
                // User previously denied — don't ask again
                return;
            }

            // 3. Permission not yet decided — request it
            const permission = await requestPermission();
            if (permission === "granted" && !disposed) {
                await subscribeToPush(token);
            }
        };

        // Try immediately
        setup();

        // Poll for token (AppLayout mounts before user logs in)
        const interval = setInterval(() => {
            if (getToken()) {
                setup();
            }
        }, 2000);

        return () => {
            disposed = true;
            clearInterval(interval);
        };
    }, []);
}
