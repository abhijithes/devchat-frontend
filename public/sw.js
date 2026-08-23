// Service Worker for Web Push Notifications

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim());
});

// Handle incoming push notifications
self.addEventListener("push", (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch {
        data = {
            title: "DevChat",
            body: event.data.text(),
            url: "/",
        };
    }

    const title = data.title || "DevChat";
    const options = {
        body: data.body || "",
        icon: "/dev-tp.svg",
        badge: "/dev-tp.svg",
        data: { url: data.url || "/" },
        tag: "devchat-notification",
        renotify: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click — focus or open the app
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // If the app is already open, focus it and navigate
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    client.focus();
                    client.navigate(url);
                    return;
                }
            }
            // Otherwise, open a new window
            return clients.openWindow(url);
        })
    );
});
