// layout-pelanggan.js
document.addEventListener("DOMContentLoaded", function() {
    renderBottomNav();
});

function renderBottomNav() {
    // Tentukan halaman mana yang sedang aktif berdasarkan nama file URL
    const path = window.location.pathname;
    const page = path.split("/").pop();

    const navHTML = `
        <div class="bottom-nav">
            <a href="index.html" class="nav-item ${page === 'index.html' || page === '' ? 'active' : ''}">
                <i class="fas fa-home"></i>
                <span>Beranda</span>
            </a>
            <a href="riwayat.html" class="nav-item ${page === 'riwayat.html' ? 'active' : ''}">
                <i class="fas fa-history"></i>
                <span>Riwayat</span>
            </a>
            <a href="registrasi.html" class="nav-item ${page === 'registrasi.html' ? 'active' : ''}">
                <i class="fas fa-user-plus"></i>
                <span>Daftar</span>
            </a>
            <a href="profil.html" class="nav-item ${page === 'profil.html' ? 'active' : ''}">
                <i class="fas fa-user-circle"></i>
                <span>Profil</span>
            </a>
        </div>
    `;

    // Masukkan ke dalam body di posisi paling bawah
    document.body.insertAdjacentHTML('beforeend', navHTML);
}
