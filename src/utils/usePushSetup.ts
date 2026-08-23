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
        console.log("[Push] usePushSetup mounted, isPushSupported:", isPushSupported());
        console.log("[Push] Notification.permission:", Notification.permission);

        if (!isPushSupported()) return;

        let disposed = false;
        let hasSubscribed = false;

        const setup = async () => {
            if (hasSubscribed || disposed) return;

            const token = getToken();
            if (!token) return;

            console.log("[Push] Token found, setting up...");

            // Stop polling once we have a token
            hasSubscribed = true;

            // 1. Register service worker (idempotent)
            await registerServiceWorker();

            // 2. Check existing permission
            if (Notification.permission === "granted") {
                console.log("[Push] Permission already granted, subscribing...");
                await subscribeToPush(token);
                return;
            }

            if (Notification.permission === "denied") {
                console.log("[Push] Permission denied, cannot request again");
                return;
            }

            // 3. Permission not yet decided — request it
            // NOTE: On some browsers, this must come from a user gesture.
            // It will still work on most modern browsers without one.
            console.log("[Push] Requesting notification permission...");
            const permission = await requestPermission();
            console.log("[Push] Permission result:", permission);

            if (permission === "granted" && !disposed) {
                await subscribeToPush(token);
            }
        };

        // Try immediately
        setup();

        // Poll for token (AppLayout mounts before user logs in)
        const interval = setInterval(() => {
            if (!hasSubscribed) setup();
        }, 2000);

        return () => {
            disposed = true;
            clearInterval(interval);
        };
    }, []);
}
