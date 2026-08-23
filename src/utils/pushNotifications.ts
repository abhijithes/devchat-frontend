import { api_url } from "../constant/constant";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

/**
 * Convert a URL-safe base64 string to a Uint8Array for pushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if push notifications are supported in this browser
 */
export function isPushSupported(): boolean {
    return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/**
 * Register the service worker (safe to call multiple times)
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    // navigator.serviceWorker.ready always returns the existing registration
    // if already registered, or registers a new one
    return navigator.serviceWorker.ready;
}

/**
 * Request notification permission from the user
 */
export async function requestPermission(): Promise<NotificationPermission> {
    if (!isPushSupported()) return "denied";
    return await Notification.requestPermission();
}

/**
 * Subscribe to push notifications and save the subscription to the backend
 */
export async function subscribeToPush(token: string): Promise<boolean> {
    if (!VAPID_PUBLIC_KEY) {
        console.warn("[Push] VAPID public key not configured");
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        // If no subscription, create one
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
        }

        // Send subscription to backend
        const response = await fetch(`${api_url}/users/push/subscribe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(subscription),
        });

        if (response.ok) {
            console.log("[Push] ✅ Push subscription saved to server");
            return true;
        } else {
            console.error("[Push] Failed to save push subscription:", response.status);
            return false;
        }
    } catch (error) {
        console.error("[Push] Push subscription failed:", error);
        return false;
    }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(token: string): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) return true;

        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        await fetch(`${api_url}/users/push/unsubscribe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint }),
        });

        console.log("[Push] Push subscription removed");
        return true;
    } catch (error) {
        console.error("[Push] Push unsubscribe failed:", error);
        return false;
    }
}
