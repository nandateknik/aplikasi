const CONFIG = {
    // URL Google Apps Script sampeyan
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwFLqUrqy4tCCGrJHilb4eGtz1sAL28LmDwM3UIaJj-gAGeK0oFH_pEEbCXbwDavKVR/exec",
    
    // Lokasi Kantor Nanda Teknik (kanggo itungan jarak)
    KANTOR_COORDS: {
        lat: -8.1910395,
        lng: 114.3697974
    },
    
    // Itungan Biaya Operasional / Bensin
    BENSIN: {
        FREE_KM: 5,
        PER_KM_COST: 10000
    },

    // Versi Cache kanggo Service Worker (PWA)
    CACHE_NAME: 'nandateknik-pwa-v1.1',
    
    // Daftar file sing bakal disimpen offline
    ASSETS_TO_CACHE: [
        '/',
        '/index.html',
        '/assets/layout.css',
        '/assets/config.js',
        '/assets/layout.js',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
        'https://cdn.jsdelivr.net/npm/sweetalert2@11',
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    ]
};

// --- REGISTRASI SERVICE WORKER (PWA) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('PWA: Service Worker aktif neng scope:', reg.scope))
            .catch(err => console.error('PWA: Gagal registrasi SW:', err));
    });
}
