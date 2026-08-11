// File: js/app.js

// Fungsi memuat komponen dengan path relatif (Aman untuk GitHub Pages)
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Gagal muat ' + filePath);
        const htmlText = await response.text();
        document.getElementById(elementId).innerHTML = htmlText;
    } catch (error) {
        console.error("Error Loader:", error);
    }
}

// Jalankan setelah seluruh kerangka HTML siap
document.addEventListener('DOMContentLoaded', () => {
    // Proteksi: Lempar ke login jika belum ada sesi
    if (!localStorage.getItem('userData') && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Muat Sidebar dan Navbar secara bersamaan
    Promise.all([
        loadComponent('sidebar-container', './components/sidebar.html'),
        loadComponent('navbar-container', './components/navbar.html')
    ]).then(() => {
        // --- 1. Tampilkan Nama User ---
        const userData = JSON.parse(localStorage.getItem('userData'));
        const nameDisplay = document.getElementById('userNameDisplay');
        if(nameDisplay && userData) nameDisplay.textContent = `Hai, ${userData.nama}`;

        // --- 2. Deteksi Menu Aktif ---
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-page') === currentPage) {
                item.classList.add('bg-blue-50', 'text-blue-700', 'font-bold');
                item.classList.remove('text-slate-600');
                if(item.querySelector('svg')) item.querySelector('svg').classList.add('text-blue-600');
            }
        });

        // --- 3. Fitur Buka Tutup Sidebar (Mobile) ---
        const sidebar = document.getElementById('sidebar-container');
        const toggleBtn = document.getElementById('mobileMenuBtn'); // Tombol di navbar
        const closeBtn = document.getElementById('closeSidebarBtn'); // Tombol di sidebar

        // Terapkan class responsif pada kontainer sidebar
        if (sidebar) {
            sidebar.className = "w-64 bg-white border-r border-slate-200 absolute md:relative z-50 h-full transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0";
        }

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('-translate-x-full');
            });
        }
        if (closeBtn && sidebar) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
            });
        }
    });
});

// Fungsi Logout Global
function prosesLogout() {
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}
