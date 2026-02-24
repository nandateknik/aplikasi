document.addEventListener("DOMContentLoaded", function() {
    const app = document.getElementById('app');
    if (!app) return;

    const pageTitle = document.title.split('|')[0].trim();
    const currentPath = window.location.pathname.split("/").pop() || 'index.html';

    const originalContent = app.innerHTML;

    const layoutHTML = `
        <header class="d-print-none sticky-top bg-white border-bottom px-3 py-2">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <small class="text-muted d-block" style="font-size: 10px; letter-spacing: 1px;">NANDA TEKNIK</small>
                    <h5 class="fw-bold mb-0">${pageTitle}</h5>
                </div>
                <div class="bg-light p-2 rounded-circle border" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-person-circle text-primary fs-5"></i>
                </div>
            </div>
        </header>

        <main id="main-content">
            ${originalContent}
        </main>

        <nav class="bottom-nav d-print-none shadow-lg border-top">
            <a href="index.html" class="nav-item ${currentPath === 'index.html' ? 'active' : ''}">
                <i class="bi bi-house-door${currentPath === 'index.html' ? '-fill' : ''}"></i>
                <span>Home</span>
            </a>
            <a href="pelanggan.html" class="nav-item ${currentPath === 'pelanggan.html' ? 'active' : ''}">
                <i class="bi bi-people${currentPath === 'pelanggan.html' ? '-fill' : ''}"></i>
                <span>Pelanggan</span>
            </a>
            <a href="nota.html" class="nav-item ${currentPath === 'nota.html' ? 'active' : ''}">
                <i class="bi bi-receipt${currentPath === 'nota.html' ? '-fill' : ''}"></i>
                <span>Nota</span>
            </a>
            <a href="booking.html" class="nav-item ${currentPath === 'booking.html' ? 'active' : ''}">
                <i class="bi bi-calendar-check${currentPath === 'booking.html' ? '-fill' : ''}"></i>
                <span>Booking</span>
            </a>
            <a href="#" class="nav-item" data-bs-toggle="offcanvas" data-bs-target="#moreMenu">
                <i class="bi bi-grid-fill"></i>
                <span>More</span>
            </a>
        </nav>

        <div class="offcanvas offcanvas-bottom rounded-top-4" tabindex="-1" id="moreMenu" style="height: auto; max-height: 70vh;">
            <div class="offcanvas-header border-bottom">
                <h6 class="offcanvas-title fw-bold"><i class="bi bi-grid me-2"></i>Menu Tambahan</h6>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
            <div class="offcanvas-body p-4">
                <div class="row g-4 text-center">
                    <div class="col-4">
                        <a href="penawaran.html" class="text-decoration-none text-dark">
                            <div class="p-3 bg-light rounded-4 mb-2 border"><i class="bi bi-file-earmark-text fs-3 text-success"></i></div>
                            <small>Penawaran</small>
                        </a>
                    </div>
                    <div class="col-4">
                        <a href="teknisi.html" class="text-decoration-none text-dark">
                            <div class="p-3 bg-light rounded-4 mb-2 border"><i class="bi bi-tools fs-3 text-warning"></i></div>
                            <small>Teknisi</small>
                        </a>
                    </div>
                    <div class="col-4">
                        <a href="labarugi.html" class="text-decoration-none text-dark">
                            <div class="p-3 bg-light rounded-4 mb-2 border"><i class="bi bi-graph-up-arrow fs-3 text-danger"></i></div>
                            <small>Laba Rugi</small>
                        </a>
                    </div>
                    <div class="col-4">
                        <a href="harga.html" class="text-decoration-none text-dark">
                            <div class="p-3 bg-light rounded-4 mb-2 border"><i class="bi bi-tags fs-3 text-primary"></i></div>
                            <small>Daftar Harga</small>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    app.innerHTML = layoutHTML;
});
