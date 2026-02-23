document.addEventListener("DOMContentLoaded", function() {
    const sidebarHTML = `
    <div class="sidebar bg-dark text-white p-3" style="width: 250px; min-height: 100vh; position: fixed;">
        <h4 class="text-center mb-4 border-bottom pb-2">${CONFIG.APP_NAME}</h4>
        <ul class="nav flex-column">
            <li class="nav-item"><a href="pelanggan.html" class="nav-link text-white"><i class="bi bi-people me-2"></i> Pelanggan</a></li>
            <li class="nav-item"><a href="teknisi.html" class="nav-link text-white"><i class="bi bi-person-badge me-2"></i> Teknisi</a></li>
            <li class="nav-item"><a href="booking.html" class="nav-link text-white"><i class="bi bi-calendar-check me-2"></i> Booking</a></li>
            <li class="nav-item"><a href="harga.html" class="nav-link text-white"><i class="bi bi-tags me-2"></i> Harga</a></li>
            <hr>
            <li class="nav-item"><a href="labarugi.html" class="nav-link text-white"><i class="bi bi-graph-up me-2"></i> Laba Rugi</a></li>
        </ul>
    </div>
    <div class="main-content" style="margin-left: 250px; padding: 20px; width: calc(100% - 250px);">
        <nav class="navbar navbar-expand-lg navbar-light bg-light rounded shadow-sm mb-4">
            <div class="container-fluid">
                <span class="navbar-brand">Dashboard</span>
            </div>
        </nav>
        <div id="content-area"></div>
    </div>`;
    
    // Inject sidebar ke body (pastikan ada div id="app")
    const app = document.getElementById('app');
    const originalContent = app.innerHTML;
    app.innerHTML = sidebarHTML;
    document.getElementById('content-area').innerHTML = originalContent;
});
