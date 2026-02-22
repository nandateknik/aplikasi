// js/config.js

// 1. Inisialisasi Database
const db = new Dexie("POS_SYSTEM");
db.version(1).stores({
    products: '++id, nama, harga, stock',
    users: 'username, password, role, nama', // Penting: Harus ada store users
    settings: 'id',
    transactions: '++id, waktu, total, bayar, kembali'
});

// 2. Cek Session (Proteksi Halaman)
const session = JSON.parse(localStorage.getItem("pos_session"));

// Jika tidak ada session dan bukan di halaman login, tendang ke login.html
if (!session && !window.location.href.includes('login.html')) {
    window.location.href = 'login.html';
}

// 3. Fungsi Logout Universal
function logout() {
    localStorage.removeItem("pos_session");
    window.location.href = 'login.html';
}

// 4. URL API (Opsional untuk Sync Cloud)
const URL_API = 'https://script.google.com/macros/s/AKfycbyDo9YNJ-z_T51k8gtJc8lxl8LUft1OED2Sm5ExkT6RA-SOvuP3WRHr9Yd2v2LRlZ7e/exec';
