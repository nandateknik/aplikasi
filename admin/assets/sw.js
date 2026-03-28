const CACHE_NAME = 'nandateknik-cache';
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'pekerjaan.html',
  'penawaran.html',
  'pelanggan.html',
];

// 1. Proses Install: Nyimpen aset penting neng cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache dibuka, nyimpen aset...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Proses Aktivasi: Ngresiki cache lawas nek sampeyan update versi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Ngresiki cache lawas...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Proses Fetch: Jupuk data saka cache disik, nek raono nembe jupuk internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
