// Konfigurasi Database IndexedDB
const db = new Dexie("POS_SYSTEM");
db.version(1).stores({
    products: '++id, nama, harga, stock',
    settings: 'id'
});

const URL_API = 'https://script.google.com/macros/s/AKfycbyDo9YNJ-z_T51k8gtJc8lxl8LUft1OED2Sm5ExkT6RA-SOvuP3WRHr9Yd2v2LRlZ7e/exec';

// Fungsi proteksi halaman
const session = JSON.parse(localStorage.getItem("pos_session"));
if (!session && !window.location.href.includes('login.html')) {
    window.location.href = 'login.html';
}
