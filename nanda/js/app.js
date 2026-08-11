// File: js/app.js

// Fungsi untuk memuat komponen HTML eksternal
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Gagal memuat ${filePath}`);
        
        const htmlText = await response.text();
        document.getElementById(elementId).innerHTML = htmlText;
    } catch (error) {
        console.error("Error Loader:", error);
    }
}

// Fungsi proteksi halaman (harus login)
function checkAuth() {
    if (!localStorage.getItem('userData')) {
        window.location.href = 'login.html';
    }
}

// Jalankan saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); // Pastikan user sudah login
    
    // Muat komponen secara asinkron (bersamaan)
Promise.all([
        loadComponent('sidebar-container', 'components/sidebar.html'),
        loadComponent('navbar-container', 'components/navbar.html')
    ]).then(() => {
        // 1. Tampilkan nama user di Navbar
        const userData = JSON.parse(localStorage.getItem('userData'));
        const nameDisplay = document.getElementById('userNameDisplay');
        if(nameDisplay && userData) nameDisplay.textContent = `Hai, ${userData.nama}`;
        
        // 2. Deteksi otomatis halaman yang sedang dibuka untuk Sidebar
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            if (item.getAttribute('data-page') === currentPage) {
                // Tambahkan warna biru tebal untuk halaman yang sedang aktif
                item.classList.remove('text-slate-600');
                item.classList.add('bg-blue-50', 'text-blue-700', 'font-semibold');
                item.querySelector('svg').classList.add('text-blue-600');
            }
        });
    });
// Fungsi Logout Global
function prosesLogout() {
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}
