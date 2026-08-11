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
        // Setelah navbar dimuat, pasang nama user
        const userData = JSON.parse(localStorage.getItem('userData'));
        const nameDisplay = document.getElementById('userNameDisplay');
        if(nameDisplay && userData) {
            nameDisplay.textContent = `Hai, ${userData.nama}`;
        }
    });
});

// Fungsi Logout Global
function prosesLogout() {
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}
