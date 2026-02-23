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
    
    try {
        const stats = await CONFIG.getData("any", "getStats");
        
        content.innerHTML = `
            <div class="row g-3 animate__animated animate__fadeIn">
                <div class="col-6 col-md-3">
                    <div class="card p-3 shadow-sm border-0 bg-primary text-white card-mobile">
                        <small>Pelanggan</small><h3>${stats.totalPelanggan || 0}</h3>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="card p-3 shadow-sm border-0 bg-warning text-dark card-mobile">
                        <small>Pending Jobs</small><h3>${stats.pendingJobs || 0}</h3>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="card p-3 shadow-sm border-0 bg-success text-white card-mobile">
                        <small>Estimasi Saldo Bulan Ini</small><h3>${Utils.formatRupiah(stats.pendapatanBulanan - stats.pengeluaranBulanan)}</h3>
                    </div>
                </div>
                
                <div class="col-12 mt-3">
                    <ul class="nav nav-pills mb-2" id="dbTab">
                        <li class="nav-item"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#tab-graph">Grafik Laba</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-map" onclick="initMap()">Peta Lokasi</button></li>
                    </ul>
                    <div class="tab-content card p-3 shadow-sm border-0">
                        <div class="tab-pane fade show active" id="tab-graph">
                            <canvas id="myChart" style="max-height: 300px;"></canvas>
                        </div>
                        <div class="tab-pane fade" id="tab-map">
                            <div id="map" style="height: 350px; border-radius: 10px;"></div>
                        </div>
                    </div>
                </div>
            </div>`;

        // Safe Chart Initialization
        if (typeof Chart !== 'undefined' && stats.chartData) {
            new Chart(document.getElementById('myChart'), {
                type: 'line',
                data: {
                    labels: stats.chartData.labels,
                    datasets: [{ label: 'Nominal', data: stats.chartData.values, borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.3 }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    } catch (err) {
        content.innerHTML = `<div class="alert alert-warning">Gagal memuat dashboard. Pastikan Sheet "Labarugi" & "Booking" terisi.</div>`;
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
