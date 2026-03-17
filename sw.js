const CACHE_NAME = 'skaiste-tasks-v1';
const ASSETS = ['index.html', 'tasks.json', 'manifest.json'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ));
});

self.addEventListener('fetch', e => {
    if (e.request.url.includes('tasks.json')) {
        // Network first for data
        e.respondWith(
            fetch(e.request).then(r => {
                const clone = r.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                return r;
            }).catch(() => caches.match(e.request))
        );
    } else {
        // Cache first for app shell
        e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request))
        );
    }
});
