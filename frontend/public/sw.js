self.addEventListener('push', function (event) {
    console.log('Push message received:', event);
    if (event.data) {
        try {
            const data = event.data.json();
            console.log('Push data payload:', data);
            const options = {
                body: data.body,
                icon: data.icon || '/vite.svg',
                badge: '/vite.svg',
                vibrate: [100, 50, 100],
                data: {
                    url: data.data?.url || '/'
                }
            };

            event.waitUntil(
                self.registration.showNotification(data.title, options)
            );
        } catch (e) {
            console.error('Error parsing push data:', e);
        }
    } else {
        console.warn('Push event received but no data found.');
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
