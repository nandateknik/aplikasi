document.addEventListener("DOMContentLoaded", function() {
    // 1. TEMPLATE HEADER
    const headerTemplate = `
    <header class="premium-header">
        <div class="bubble-wrap">
            <div class="bubble" style="width:60px; height:60px; left:10%; animation-duration:8s;"></div>
            <div class="bubble" style="width:80px; height:80px; left:70%; animation-duration:10s; animation-delay:4s;"></div>
        </div>
        <div class="user-profile container">
            <div class="d-flex align-items-center">
                <div class="bg-white rounded-circle me-3 shadow-sm d-flex align-items-center justify-content-center" style="width:45px; height:45px;">
                    <i class="fas fa-user-tie text-primary fs-4"></i>
                </div>
                <div>
                    <small class="opacity-75 d-block" style="font-size: 0.65rem;">Administrator</small>
                    <span class="fw-bold">Nanda Krisbianto</span>
                </div>
            </div>
            <button class="logout-btn" onclick="confirmLogout()"><i class="fas fa-power-off"></i></button>
        </div>
        <div class="text-center mt-4 position-relative" style="z-index:2;">
            <h4 class="fw-bold mb-0">Nanda Teknik</h4>
            <p class="small opacity-75">Banyuwangi Service Hub</p>
        </div>
    </header>`;

    // 2. TEMPLATE BOTTOM NAV
    const navTemplate = `
    <nav class="bottom-nav">
        <a href="admin-pekerjaan.html" class="nav-link" id="nav-job">
            <i class="fas fa-clipboard-list"></i><span>Job</span>
        </a>
        <a href="admin-pelanggan.html" class="nav-link" id="nav-client">
            <i class="fas fa-users"></i><span>Client</span>
        </a>
        <div class="nav-center">
            <a href="admin-buat-wo.html" class="btn-plus-main">
                <i class="fas fa-plus fs-4"></i>
            </a>
        </div>
        <a href="admin-labarugi.html" class="nav-link" id="nav-kas">
            <i class="fas fa-chart-pie"></i><span>Kas</span>
        </a>
        <div class="dropup">
            <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                <i class="fas fa-th-large"></i><span>More</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow">
                <li><a class="dropdown-item py-2 small" href="admin-harga.html"><i class="fas fa-tag me-2 text-primary"></i> Master Harga</a></li>
                <li><a class="dropdown-item py-2 small" href="admin-penawaran.html"><i class="fas fa-file-contract me-2 text-primary"></i> Penawaran</a></li>
                <li><a class="dropdown-item py-2 small" href="admin-esign.html"><i class="fas fa-signature me-2 text-primary"></i> E-Signature</a></li>
            </ul>
        </div>
    </nav>`;

    // SUNTIKNE NENG BODY
    document.body.insertAdjacentHTML('afterbegin', headerTemplate); // Header neng dhuwur
    document.body.insertAdjacentHTML('beforeend', navTemplate);    // Nav neng ngisor

    // OTOMATIS SET ACTIVE CLASS
    const currentPage = window.location.pathname.split("/").pop();
    if(currentPage === "admin-pekerjaan.html") document.getElementById('nav-job').classList.add('active');
    if(currentPage === "admin-pelanggan.html") document.getElementById('nav-client').classList.add('active');
    if(currentPage === "admin-labarugi.html") document.getElementById('nav-kas').classList.add('active');
});

function confirmLogout() {
    Swal.fire({
        title: 'Logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        confirmButtonColor: '#0052d4'
    }).then(r => { if(r.isConfirmed) window.location.href='login.html' });
}
