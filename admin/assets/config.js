var CONFIG = {
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwFLqUrqy4tCCGrJHilb4eGtz1sAL28LmDwM3UIaJj-gAGeK0oFH_pEEbCXbwDavKVR/exec",
    KANTOR_COORDS: {
        lat: -8.1910395,
        lng: 114.3697974
    },
    BENSIN: {
        FREE_KM: 5,
        PER_KM_COST: 10000
    },
    // Fungsi cek login
    checkAuth: function() {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.replace('login.html'); // Menggunakan replace agar tidak bisa di-back
        }
    }
};
