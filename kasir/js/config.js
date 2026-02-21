// Konfigurasi Database IndexedDB
const db = new Dexie("POS_SYSTEM");
db.version(1).stores({
    products: '++id, nama, harga, stock',
    settings: 'id'
});

const URL_API = 'URL_APPS_SCRIPT_ANDA';

// Fungsi proteksi halaman
const session = JSON.parse(localStorage.getItem("pos_session"));
if (!session && !window.location.href.includes('login.html')) {
    window.location.href = 'login.html';
}
