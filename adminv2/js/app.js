/**
 * CRM Jasa Servis - Main App Logic
 * Version: 3.1 (Fix Chart & Map Loading)
 */

const menus = [
    { id: 'Dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { id: 'Pelanggan', icon: 'bi-people', label: 'Pelanggan' },
    { id: 'Booking', icon: 'bi-calendar-event', label: 'Booking' },
    { id: 'Nota', icon: 'bi-file-earmark-text', label: 'Nota' },
    { id: 'Penawaran', icon: 'bi-briefcase', label: 'Penawaran' },
    { id: 'Labarugi', icon: 'bi-graph-up-arrow', label: 'Laba Rugi' },
    { id: 'Teknisi', icon: 'bi-person-badge', label: 'Teknisi' },
    { id: 'Harga', icon: 'bi-tags', label: 'Harga Jasa' }
];

let currentModule = 'Dashboard';
let mapInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('userCRM')) {
        window.location.href = "login.html";
        return;
    }
    renderMenus();
    loadModule('Dashboard'); 
});

function renderMenus() {
    const mobileContainer = document.getElementById('menuMobile');
    const desktopContainer = document.getElementById('menuDesktop');
    const user = JSON.parse(localStorage.getItem('userCRM'));
    
    document.getElementById('userProfile').innerHTML = `<i class="bi bi-person-circle"></i> ${user.nama}`;
    mobileContainer.innerHTML = '';
    desktopContainer.innerHTML = '';

    menus.forEach(m => {
        mobileContainer.innerHTML += `
            <a href="#" onclick="loadModule('${m.id}')" id="m-mob-${m.id}" class="nav-link-custom">
                <i class="bi ${m.icon}"></i><span>${m.label}</span>
            </a>`;
        
        desktopContainer.innerHTML += `
            <a href="#" class="list-group-item list-group-item-action border-0 py-3 menu-item" onclick="loadModule('${m.id}')" id="m-desk-${m.id}">
                <i class="bi ${m.icon} me-2"></i> ${m.label}
            </a>`;
    });
}

async function loadModule(moduleName) {
    currentModule = moduleName;
    document.getElementById('pageTitle').innerText = moduleName;
    const content = document.getElementById('mainContent');
    
    // UI Active State
    document.querySelectorAll('.nav-link-custom, .menu-item').forEach(el => el.classList.remove('active', 'bg-primary', 'text-white'));
    const activeMob = document.getElementById(`m-mob-${moduleName}`);
    const activeDesk = document.getElementById(`m-desk-${moduleName}`);
    if(activeMob) activeMob.classList.add('active');
    if(activeDesk) activeDesk.classList.add('active', 'bg-primary', 'text-white');

    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div><p>Memuat Data...</p></div>';

    try {
        if (moduleName === 'Dashboard') {
            await renderDashboard();
        } else {
            const data = await CONFIG.getData(moduleName);
            renderTable(moduleName, data);
        }
    } catch (e) {
        content.innerHTML = `<div class="alert alert-danger">Koneksi Error: ${e.message}</div>`;
    }
}

async function renderDashboard() {
    const content = document.getElementById('mainContent');
    content.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>';

    try {
        const stats = await CONFIG.getData("any", "getStats"); // Data angka
        const allBookings = await CONFIG.getData("Booking"); // Data detail tugas

        // Filter Tugas
        const urgentJobs = allBookings.filter(b => b.status !== "Selesai" && b.prioritas === "Urgent");
        const todayJobs = allBookings.filter(b => b.status !== "Selesai" && b.tanggal === new Date().toISOString().split('T')[0]);

        content.innerHTML = `
            <div class="d-flex gap-2 mb-4 overflow-x-auto pb-2">
                <button class="btn btn-primary rounded-pill shadow-sm flex-shrink-0" onclick="openForm('Booking')">
                    <i class="bi bi-plus-circle me-1"></i> Tambah Kerja
                </button>
                <button class="btn btn-outline-primary rounded-pill shadow-sm flex-shrink-0" onclick="loadModule('Pelanggan')">
                    <i class="bi bi-search me-1"></i> Cari User
                </button>
            </div>

            ${urgentJobs.length > 0 ? `
            <div class="alert alert-danger border-0 shadow-sm mb-4 animate__animated animate__headShake">
                <div class="d-flex align-items-center">
                    <i class="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                    <div>
                        <h6 class="mb-0 fw-bold">Perhatian!</h6>
                        <small>Ada ${urgentJobs.length} pekerjaan Urgent yang belum beres.</small>
                    </div>
                </div>
            </div>` : ''}

            <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                    <div class="card p-3 border-0 shadow-sm bg-white card-mobile">
                        <span class="text-muted small">Job Hari Ini</span>
                        <h4 class="fw-bold mb-0">${todayJobs.length}</h4>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card p-3 border-0 shadow-sm bg-white card-mobile">
                        <span class="text-muted small">Total Pending</span>
                        <h4 class="fw-bold mb-0 text-warning">${stats.pendingJobs}</h4>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="card p-3 border-0 shadow-sm bg-white card-mobile">
                        <span class="text-muted small">Estimasi Cuan (Bulan Ini)</span>
                        <h4 class="fw-bold mb-0 text-success">${Utils.formatRupiah(stats.pendapatanBulanan - stats.pengeluaranBulanan)}</h4>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-lg-7 mb-4">
                    <h6 class="fw-bold mb-3"><i class="bi bi-list-check me-2"></i>Agenda Kerja Hari Ini</h6>
                    <div id="todayTaskList">
                        ${todayJobs.length === 0 ? '<div class="text-muted small p-4 text-center bg-light rounded">Santai dulu, belum ada jadwal hari ini.</div>' : ''}
                        ${todayJobs.map(job => `
                            <div class="card border-0 shadow-sm mb-2 p-3">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="text-truncate" style="max-width: 70%;">
                                        <div class="fw-bold">${job.judul}</div>
                                        <small class="text-muted">${job.nama}</small>
                                    </div>
                                    <button class="btn btn-sm btn-light" onclick="Utils.sendWhatsApp('${job.wa}', 'Halo Pak ${job.nama}, teknisi akan meluncur ke lokasi.')">
                                        <i class="bi bi-whatsapp text-success"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="col-lg-5">
                    <ul class="nav nav-pills mb-3 p-1 bg-light rounded-pill" id="pills-tab">
                        <li class="nav-item flex-fill"><button class="nav-link active rounded-pill w-100" data-bs-toggle="pill" data-bs-target="#tab-map" onclick="initMap()">Lokasi</button></li>
                        <li class="nav-item flex-fill"><button class="nav-link rounded-pill w-100" data-bs-toggle="pill" data-bs-target="#tab-graph">Laba</button></li>
                    </ul>
                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="tab-map">
                            <div id="map" style="height: 300px; border-radius: 20px;" class="shadow-sm"></div>
                        </div>
                        <div class="tab-pane fade" id="tab-graph">
                            <div class="card border-0 shadow-sm p-3">
                                <canvas id="myChart" style="max-height: 250px;"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render Chart jika tab laba diklik
        if (typeof Chart !== 'undefined') {
            new Chart(document.getElementById('myChart'), {
                type: 'bar',
                data: {
                    labels: stats.chartData.labels,
                    datasets: [{ label: 'Pendapatan', data: stats.chartData.values, backgroundColor: '#6366f1', borderRadius: 10 }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
        }
        
        // Auto init Map
        initMap();

    } catch (e) {
        console.error(e);
        content.innerHTML = `<div class="alert alert-danger">Dashboard error: ${e.message}</div>`;
    }
}

async function initMap() {
    // Timeout agar elemen #map ter-render dulu di DOM
    setTimeout(async () => {
        if (mapInstance) mapInstance.remove();
        
        // Cek apakah library Leaflet (L) ada
        if (typeof L === 'undefined') return;

        mapInstance = L.map('map').setView([-6.2000, 106.8166], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);

        const pelanggan = await CONFIG.getData("Pelanggan");
        const bookings = await CONFIG.getData("Booking");

        pelanggan.forEach(p => {
            if (p.lat && p.lang) L.marker([p.lat, p.lang]).addTo(mapInstance).bindPopup(`Pelanggan: ${p.nama}`);
        });

        bookings.filter(b => b.status !== "Selesai").forEach(b => {
            if (b.lat && b.langa) {
                L.circleMarker([b.lat, b.langa], {color: 'red', radius: 8, fillOpacity: 0.8}).addTo(mapInstance).bindPopup(`<b>PENDING</b><br>${b.judul}`);
            }
        });
        
        // Memaksa leaflet menghitung ulang ukuran container
        mapInstance.invalidateSize();
    }, 400);
}

function renderTable(name, data) {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="d-flex justify-content-between mb-3 gap-2">
            <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control border-start-0" placeholder="Cari data..." onkeyup="searchData('${name}', this.value)">
            </div>
            <button class="btn btn-primary px-4" onclick="openForm('${name}')"><i class="bi bi-plus-lg"></i> <span class="d-none d-md-inline">Tambah</span></button>
        </div>
        <div class="row" id="dataList"></div>
    `;

    const list = document.getElementById('dataList');
    if(data.length === 0) {
        list.innerHTML = '<div class="text-center p-5 text-muted">Tidak ada data ditemukan.</div>';
        return;
    }

    data.forEach(item => {
        const idKey = item.id || item.nama || item.email;
        list.innerHTML += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card card-mobile p-3 border-0 shadow-sm h-100">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="text-truncate">
                            <h6 class="fw-bold mb-1 text-truncate">${item.nama || item.judul || item.Jasa || 'Tanpa Nama'}</h6>
                            <p class="small text-muted mb-2">${item.email || item.Keterangan || item.tanggal || '-'}</p>
                        </div>
                        <span class="badge ${item.status === 'Selesai' || item.is_active === 'TRUE' ? 'bg-success' : 'bg-secondary'}">${item.status || (item.is_active === 'TRUE' ? 'Aktif' : 'Nonaktif')}</span>
                    </div>
                    <div class="mt-auto d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary flex-grow-1" onclick="openForm('${name}', '${idKey}')"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteData('${name}', '${idKey}')"><i class="bi bi-trash"></i></button>
                        ${name === 'Nota' ? `<button class="btn btn-sm btn-danger" onclick="Utils.generatePDF(${JSON.stringify(item)}, 'NOTA')"><i class="bi bi-file-pdf"></i></button>` : ''}
                        ${item.wa ? `<button class="btn btn-sm btn-success" onclick="Utils.sendWhatsApp('${item.wa}', 'Halo Pak/Bu ${item.nama}, kami dari Nanda Teknik...')"><i class="bi bi-whatsapp"></i></button>` : ''}
                    </div>
                </div>
            </div>`;
    });
}

// Tambahkan sisa fungsi CRUD (openForm, deleteData, searchData, logout) sesuai kode sebelumnya...
