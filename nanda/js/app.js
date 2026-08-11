// File: js/app.js

// Fungsi cerdas untuk mendapatkan base path (kebal error di GitHub Pages)
function getBasePath() {
    const path = window.location.pathname;
    return path.substring(0, path.lastIndexOf('/') + 1);
}

// Fungsi memuat komponen
async function loadComponent(elementId, filePath) {
    try {
        // Gabungkan base path dengan file path agar valid di GitHub Pages
        const fullPath = getBasePath() + filePath; 
        const response = await fetch(fullPath);
        
        if (!response.ok) throw new Error(`Gagal memuat ${fullPath}`);
        
        const htmlText = await response.text();
        document.getElementById(elementId).innerHTML = htmlText;
    } catch (error) {
        console.error("Error Loader:", error);
    }
}

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Login
    if (!localStorage.getItem('userData') && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Muat Sidebar dan Navbar (Menggunakan ./ agar aman di GitHub Pages)
    Promise.all([
        loadComponent('sidebar-container', 'components/sidebar.html'),
        loadComponent('navbar-container', 'components/navbar.html')
    ]).then(() => {
        setupLayout();
    });
});

// Setup interaksi setelah komponen dimuat
function setupLayout() {
    // Tampilkan Nama User
    const userData = JSON.parse(localStorage.getItem('userData'));
    const nameDisplay = document.getElementById('userNameDisplay');
    if(nameDisplay && userData) nameDisplay.textContent = `Hai, ${userData.nama}`;

    // Aktifkan Warna Menu Sesuai Halaman
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-page') === currentPage) {
            item.classList.remove('text-slate-600');
            item.classList.add('bg-blue-50', 'text-blue-700', 'font-semibold');
            item.querySelector('svg').classList.add('text-blue-600');
        }
    });

    // ================= FITUR MENU MOBILE =================
    const sidebar = document.getElementById('main-sidebar');
    const btnMenu = document.getElementById('mobileMenuBtn');
    const overlay = document.getElementById('sidebar-overlay');

    if(btnMenu && sidebar && overlay) {
        // Buka Sidebar
        btnMenu.addEventListener('click', () => {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        });

        // Tutup Sidebar jika klik area gelap
        overlay.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        });
    }
}

function prosesLogout() {
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}
