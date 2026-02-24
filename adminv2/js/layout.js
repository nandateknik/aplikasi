document.addEventListener("DOMContentLoaded", function() {
    const app = document.getElementById('app');
    if (!app) return;

    // Ambil judul halaman dari dokumen
    const pageTitle = document.title.split('|')[0].trim();
    const currentPath = window.location.pathname.split("/").pop();

    const originalContent = app.innerHTML;

    const layoutHTML = `
        <header class="premium-header">
            <div class="d-flex justify-content-between align-items-center">
                <h1>${pageTitle}</h1>
                <div style="width: 35px; height: 35px; background: #E5E5EA; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-person-fill text-secondary"></i>
                </div>
            </div>
        </header>

        <main id="main-content" class="p-3">
            ${originalContent}
        </main>

        <nav class="bottom-nav">
            <a href="index.html" class="nav-item ${currentPath === 'index.html' ? 'active' : ''}">
                <i class="bi bi-house-door${currentPath === 'index.html' ? '-fill' : ''}"></i>
                <span>Home</span>
            </a>
            <a href="booking.html" class="nav-item ${currentPath === 'booking.html' ? 'active' : ''}">
                <i class="bi bi-calendar-check${currentPath === 'booking.html' ? '-fill' : ''}"></i>
                <span>Booking</span>
            </a>
            <a href="pelanggan.html" class="nav-item ${currentPath === 'pelanggan.html' ? 'active' : ''}">
                <i class="bi bi-people${currentPath === 'pelanggan.html' ? '-fill' : ''}"></i>
                <span>Pelanggan</span>
            </a>
            <a href="nota.html" class="nav-item ${currentPath === 'nota.html' ? 'active' : ''}">
                <i class="bi bi-file-earmark-text${currentPath === 'nota.html' ? '-fill' : ''}"></i>
                <span>Nota</span>
            </a>
            <a href="labarugi.html" class="nav-item ${currentPath === 'labarugi.html' ? 'active' : ''}">
                <i class="bi bi-graph-up-arrow"></i>
                <span>Laba Rugi</span>
            </a>
        </nav>
    `;

    app.innerHTML = layoutHTML;
});
