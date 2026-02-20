document.addEventListener("DOMContentLoaded", function() {
    // --- 1. REGISTRASI SERVICE WORKER (PWA) ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Pastikan file sw.js ada di root directory
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('PWA: Service Worker aktif!'))
                .catch(err => console.error('PWA: Gagal registrasi SW:', err));
        });
    }

    // --- 2. LOGIC SALAM (Dinamis sesuai jam) ---
    const jam = new Date().getHours();
    let salam = "Sugeng Enjang";
    if (jam >= 11 && jam < 15) salam = "Sugeng Siang";
    if (jam >= 15 && jam < 19) salam = "Sugeng Sonten";
    if (jam >= 19 || jam < 4) salam = "Sugeng Dalu";

    // --- 3. TEMPLATE HEADER ---
    const headerTemplate = `
    <header class="new-header">
        <div class="header-wave">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fill-opacity="0.1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,0L1392,0L0,0Z"></path></svg>
        </div>
        <div class="container header-content">
            <div class="d-flex justify-content-between align-items-center">
                <div class="user-info-box">
                    <div class="avatar-wrapper">
                        <img src="https://ui-avatars.com/api/?name=Nanda+Krisbianto&background=fff&color=0052d4" alt="avatar">
                    </div>
                    <div class="ms-3">
                        <p class="greeting">${salam}, Mas</p>
                        <h5 class="user-name">Nanda Krisbianto</h5>
                    </div>
                </div>
                <button class="btn-logout-new" onclick="confirmLogout()">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>

            <div class="brand-card animate__animated animate__fadeInUp">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="brand-title">Nanda Teknik</h4>
                        <p class="brand-sub">Spesialis Pendingin & Teknik</p>
                    </div>
                    <span class="badge bg-primary rounded-pill" style="font-size: 0.6rem;">Admin Pro</span>
                </div>
            </div>
        </div>
    </header>`;

    // --- 4. TEMPLATE BOTTOM NAV ---
    const navTemplate = `
    <nav class="bottom-nav">
        <a href="pekerjaan.html" class="nav-link" id="nav-job">
            <i class="fas fa-clipboard-list"></i><span>Job</span>
        </a>
        <a href="pelanggan.html" class="nav-link" id="nav-client">
            <i class="fas fa-users"></i><span>Client</span>
        </a>
        <div class="nav-center">
            <a href="booking.html" class="btn-plus-main">
                <i class="fas fa-plus fs-4"></i>
            </a>
        </div>
        <a href="labarugi.html" class="nav-link" id="nav-kas">
            <i class="fas fa-chart-pie"></i><span>Kas</span>
        </a>
        <div class="dropup">
            <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                <i class="fas fa-th-large"></i><span>More</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow">
                <li><a class="dropdown-item py-2 small" href="harga.html"><i class="fas fa-tag me-2 text-primary"></i> Master Harga</a></li>
                <li><a class="dropdown-item py-2 small" href="penawaran.html"><i class="fas fa-file-contract me-2 text-primary"></i> Penawaran</a></li>
                <li><a class="dropdown-item py-2 small" href="esign.html"><i class="fas fa-signature me-2 text-primary"></i> E-Signature</a></li>
            </ul>
        </div>
    </nav>`;
    
    // SUNTIK KE HTML
    document.body.insertAdjacentHTML('afterbegin', headerTemplate);
    document.body.insertAdjacentHTML('beforeend', navTemplate);

    // OTOMATIS SET ACTIVE CLASS
    const currentPage = window.location.pathname.split("/").pop();
    const navMapping = {
        "pekerjaan.html": "nav-job",
        "pelanggan.html": "nav-client",
        "labarugi.html": "nav-kas"
    };
    if (navMapping[currentPage]) {
        document.getElementById(navMapping[currentPage]).classList.add('active');
    }
});

// --- 5. FUNGSI LOGOUT ---
function confirmLogout() {
    Swal.fire({
        title: 'Logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        confirmButtonColor: '#0052d4'
    }).then(r => { 
        if(r.isConfirmed) {
            localStorage.removeItem('isLoggedIn');
            window.location.href='login.html';
        }
    });
}

// --- 6. AUTH CHECK ---
if (localStorage.getItem('isLoggedIn') !== 'true') {
     window.location.replace('login.html');
}
