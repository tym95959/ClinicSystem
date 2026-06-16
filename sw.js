const CACHE_NAME = 'hopedental-v2';
const urlsToCache = [
    '/',
    '/login.html',
    '/clinicdash.html',
    '/doctor-portal.html',
    '/firebase-config.js',
    '/device-config.js',
    '/manifest.json',
    '/hope1.png'
];

// Install service worker with error handling
self.addEventListener('install', function(event) {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache opened, adding files...');
                // Try to cache each file individually to avoid one failure breaking everything
                return Promise.all(
                    urlsToCache.map(function(url) {
                        return cache.add(url).catch(function(err) {
                            console.warn('Failed to cache:', url, err);
                            // Continue with other files even if one fails
                            return Promise.resolve();
                        });
                    })
                );
            })
            .then(function() {
                console.log('All possible files cached');
                return self.skipWaiting();
            })
            .catch(function(err) {
                console.error('Cache installation error:', err);
            })
    );
});

// Fetch with network-first strategy for better reliability
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request because it's a one-time use
                var fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then(function(response) {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response because it's a one-time use
                        var responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(function(err) {
                                console.warn('Failed to cache:', event.request.url, err);
                            });
                        
                        return response;
                    })
                    .catch(function(err) {
                        console.warn('Fetch failed:', event.request.url, err);
                        // Return a fallback response if possible
                        return caches.match('/login.html');
                    });
            })
    );
});

// Activate and clean old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cache) {
                        if (cache !== CACHE_NAME) {
                            console.log('Deleting old cache:', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(function() {
                console.log('Service Worker activated and taking control');
                return self.clients.claim();
            })
    );
});
