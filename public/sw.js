// ============================================================================
// MOBO SAVIOR — NATIVE WEB PUSH SERVICE WORKER
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received.');
  
  let data = {
    title: 'NEW BOOKING RECEIVED',
    body: 'New repair booking received. Open Admin Portal to view details.',
    tag: 'new-booking-generic',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Fallback if not JSON
      const text = event.data.text();
      if (text) {
        data.body = text;
      }
    }
  }

  // Idempotent control: OS respects identical tags and doesn't pile up duplicates
  const options = {
    body: data.body || 'New repair booking received. Open Admin Portal to view details.',
    icon: '/logo.png', // Main branding icon
    badge: '/logo.png', // Small monochrome status bar badge
    tag: data.tag || 'new-booking',
    renotify: true,
    vibrate: [200, 100, 200], // Haptic vibration on supported devices
    data: data.data || {},
  };

  // Broadcast to open clients (foreground pages) so they can show in-app toasts & play audio
  self.clients.matchAll({ type: 'window' }).then((clientList) => {
    for (const client of clientList) {
      client.postMessage({
        type: 'PUSH_RECEIVED',
        payload: {
          title: data.title || 'NEW BOOKING RECEIVED',
          body: options.body,
          data: options.data
        }
      });
    }
  });

  // Display native operating system notification
  event.waitUntil(
    self.registration.showNotification(data.title || 'NEW BOOKING RECEIVED', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.');
  event.notification.close();

  const targetUrl = '/moboadmin2026';

  // Open / Focus the Admin Portal window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if Admin Portal tab is already open
      for (const client of windowClients) {
        const url = new URL(client.url);
        if (url.pathname === targetUrl || url.pathname.startsWith('/moboadmin2026')) {
          return client.focus().then((focusedClient) => {
            // Send focus signal to the client to refresh the booking UI
            if (focusedClient) {
              focusedClient.postMessage({
                type: 'NOTIFICATION_FOCUS',
                bookingId: event.notification.data?.bookingId
              });
            }
          });
        }
      }
      
      // If not open, open a new tab/window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
