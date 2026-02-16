document.addEventListener("DOMContentLoaded", function() {
    // 1. TEMPLATE HEADER
    // 1. TEMPLATE HEADER (VERSI CUWAMIK)
    const jam = new Date().getHours();
    let salam = "Sugeng Enjang";
    if (jam >= 11 && jam < 15) salam = "Sugeng Siang";
    if (jam >= 15 && jam < 19) salam = "Sugeng Sonten";
    if (jam >= 19 || jam < 4) salam = "Sugeng Dalu";

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
                    <p class="greeting">Sugeng Dalu, Mas</p>
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
