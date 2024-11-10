const CACHE_NAME = 'fitness-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/animations.js',
  '/js/audio.js',
  '/js/exercises.js',
  '/js/mobileUtils.js',
  '/js/notifications.js',
  '/js/voicePrompts.js',
  '/js/workoutTracker.js',
  '/js/achievements.js',
  '/js/motivationalMessages.js',
  '/js/exerciseTranslations.js',
  '/images/exercises/*',
  '/sounds/*',
  '/music/*'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // Return offline fallback for HTML pages
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        ...data.options,
        icon: data.options.icon || '/images/icons/icon-192x192.png',
        badge: data.options.badge || '/images/icons/badge-72x72.png'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'snooze') {
        // Reschedule reminder for 1 hour later
        const snoozeTime = new Date(Date.now() + 60 * 60 * 1000);
        event.waitUntil(
            self.registration.showNotification('Workout Reminder Snoozed', {
                body: `We'll remind you again at ${snoozeTime.toLocaleTimeString()}`,
                icon: '/images/icons/icon-192x192.png',
                badge: '/images/icons/badge-72x72.png'
            })
        );
    } else {
        // Open the target URL
        const urlToOpen = event.notification.data?.url || '/home.html';
        event.waitUntil(
            clients.openWindow(urlToOpen)
        );
    }
});

self.addEventListener('sync', event => {
    if (event.tag === 'fitness-sync') {
        event.waitUntil(syncData());
    }
});

self.addEventListener('periodicsync', event => {
    if (event.tag === 'fitness-sync') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    const backgroundSync = new BackgroundSync();
    await backgroundSync.processSyncQueue();
}