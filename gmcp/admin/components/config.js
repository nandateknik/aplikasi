// config.js
const CONFIG = {
    // Ganti dengan URL Deploy Apps Script terbaru
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzs_Xdq2Z_N76XOrCyOqKYthiuUfeQHvdVWJaS6C977hGWHAXvwxKRLqcTsKcgmgaJE/exec",
    
    // Proteksi Login
    checkAuth: () => {
        const user = JSON.parse(localStorage.getItem('user_login'));
        // Cek apakah user ada dan memiliki role 'Admin' (sesuaikan dengan kolom role di sheet kamu)
        if (!user || user.role !== 'Admin') {
            window.location.href = "login.html"; // Redirect ke login jika bukan admin
        }
        return user;
    },

    logout: () => {
        localStorage.clear();
        window.location.href = "login.html";
    }
};
// Jalankan proteksi secepat mungkin
CONFIG.checkAuth();
