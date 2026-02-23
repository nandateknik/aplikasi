/**
 * CRM Jasa Servis - Main App Logic
 * Version: 3.0 (Dashboard, Charts, Maps, & CRUD)
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
    // Proteksi Halaman
    if (!localStorage.getItem('userCRM')) {
        window.location.href = "login.html";
        return;
    }
    
    renderMenus();
    loadModule('Dashboard'); 
});

// --- NAVIGATION ---
function renderMenus() {
    const mobileContainer = document.getElementById('menuMobile');
    const desktopContainer = document.getElementById('menuDesktop');
    const user = JSON.parse(localStorage.getItem('userCRM'));
    
    document.getElementById('userProfile').innerHTML = `<i class="bi bi-person-circle"></i> ${user.nama}`;

    menus.forEach(m => {
        mobileContainer.innerHTML += `
            <a href="#" onclick="loadModule('${m.id}')" id="m-mob-${m.id}" class="nav-link-custom">
                <i class="bi ${m.icon}"></i><span>${m.label}</span>
            </a>`;
        
        desktopContainer.innerHTML += `
            <a href="#" class="list-group-item list-group-item-action border-0 py-3" onclick="loadModule('${m.id}')" id="m-desk-${m.id}">
                <i class="bi ${m.icon} me-2"></i> ${m.label}
            </a>`;
    });
}

async function loadModule(moduleName) {
    currentModule = moduleName;
    document.getElementById('pageTitle').innerText = moduleName;
    const content = document.getElementById('mainContent');
    
    // Update Active UI
    document.querySelectorAll('.nav-link-custom, .list-group-item').forEach(el => el.classList.remove('active', 'text-primary'));

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

// --- DASHBOARD LOGIC ---
async function renderDashboard() {
    const content = document.getElementById('mainContent');
    const stats = await CONFIG.getData("any", "getStats");

    content.innerHTML = `
        <div class="row g-3">
            <div class="col-6 col-md-3">
                <div class="card p-3 shadow-sm border-0 bg-primary text-white">
                    <small>Pelanggan</small><h3>${stats.totalPelanggan}</h3>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card p-3 shadow-sm border-0 bg-warning text-dark">
                    <small>Pending Jobs</small><h3>${stats.pendingJobs}</h3>
                </div>
            </div>
            <div class="col-12 col-md-6">
                <div class="card p-3 shadow-sm border-0 bg-success text-white">
                    <small>Cuan Bulan Ini</small><h3>${Utils.formatRupiah(stats.pendapatanBulanan - stats.pengeluaranBulanan)}</h3>
                </div>
            </div>
            
            <div class="col-12 mt-3">
                <ul class="nav nav-pills mb-2" id="dbTab">
                    <li class="nav-item"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#tab-graph">Grafik</button></li>
                    <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-map" onclick="initMap()">Peta Lokasi</button></li>
                </ul>
                <div class="tab-content card p-3 shadow-sm border-0">
                    <div class="tab-pane fade show active" id="tab-graph"><canvas id="myChart" height="200"></canvas></div>
                    <div class="tab-pane fade" id="tab-map"><div id="map" style="height: 350px;"></div></div>
                </div>
            </div>
        </div>
    `;

    // Render Chart
    new Chart(document.getElementById('myChart'), {
        type: 'line',
        data: {
            labels: stats.chartData.labels,
            datasets: [{ label: 'Nominal', data: stats.chartData.values, borderColor: '#6366f1', tension: 0.3 }]
        }
    });
}

async function initMap() {
    setTimeout(async () => {
        if (mapInstance) mapInstance.remove();
        mapInstance = L.map('map').setView([-6.2000, 106.8166], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);

        const pelanggan = await CONFIG.getData("Pelanggan");
        const bookings = await CONFIG.getData("Booking");

        pelanggan.forEach(p => {
            if (p.lat && p.lang) L.marker([p.lat, p.lang]).addTo(mapInstance).bindPopup(`Pelanggan: ${p.nama}`);
        });

        bookings.filter(b => b.status !== "Selesai").forEach(b => {
            if (b.lat && b.langa) L.circleMarker([b.lat, b.langa], {color: 'red', radius: 8}).addTo(mapInstance).bindPopup(`PENDING: ${b.judul}`);
        });
    }, 500);
}

// --- DATA RENDERING ---
function renderTable(name, data) {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <input type="text" class="form-control w-50" placeholder="Cari..." onkeyup="searchData('${name}', this.value)">
            <button class="btn btn-primary" onclick="openForm('${name}')"><i class="bi bi-plus-lg"></i> Tambah</button>
        </div>
        <div class="row" id="dataList"></div>
    `;

    const list = document.getElementById('dataList');
    data.forEach(item => {
        const idKey = item.id || item.nama || item.email;
        list.innerHTML += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card card-mobile p-3 border-0 shadow-sm">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="fw-bold mb-1">${item.nama || item.judul || item.Jasa || 'Data'}</h6>
                            <p class="small text-muted mb-2">${item.email || item.Keterangan || item.tanggal || ''}</p>
                        </div>
                        <span class="badge ${item.status === 'Selesai' ? 'bg-success' : 'bg-info'}">${item.status || item.is_active || 'Aktif'}</span>
                    </div>
                    <div class="d-flex gap-2 mt-2">
                        <button class="btn btn-sm btn-light text-primary" onclick="openForm('${name}', '${idKey}')"><i class="bi bi-pencil"></i> Edit</button>
                        <button class="btn btn-sm btn-light text-danger" onclick="deleteData('${name}', '${idKey}')"><i class="bi bi-trash"></i></button>
                        ${name === 'Nota' ? `<button class="btn btn-sm btn-primary" onclick="Utils.generatePDF(${JSON.stringify(item)}, 'NOTA')"><i class="bi bi-file-pdf"></i></button>` : ''}
                        ${item.wa ? `<button class="btn btn-sm btn-success" onclick="Utils.sendWhatsApp('${item.wa}', 'Halo Pak/Bu ${item.nama}, servis kami sudah selesai.')"><i class="bi bi-whatsapp"></i></button>` : ''}
                    </div>
                </div>
            </div>`;
    });
}

// --- CRUD OPERATIONS ---
async function openForm(table, id = null) {
    let existingData = {};
    if (id) {
        const allData = await CONFIG.getData(table);
        existingData = allData.find(x => (x.id || x.nama || x.email) == id);
    }

    // Modal Form Sederhana berbasis SweetAlert
    const { value: formValues } = await Swal.fire({
        title: `${id ? 'Edit' : 'Tambah'} ${table}`,
        html: `<input id="swal-input1" class="swal2-input" placeholder="Nama/Judul" value="${existingData.nama || existingData.judul || ''}">
               <input id="swal-input2" class="swal2-input" placeholder="Email/Ket" value="${existingData.email || existingData.Keterangan || ''}">`,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
            return {
                nama: document.getElementById('swal-input1').value,
                email: document.getElementById('swal-input2').value
            }
        }
    });

    if (formValues) {
        const action = id ? 'update' : 'insert';
        const res = await CONFIG.postData(table, action, formValues, id);
        if (res.status === 'success') {
            Utils.alert('Berhasil', 'Data telah diperbarui');
            loadModule(table);
        }
    }
}

async function deleteData(table, id) {
    const confirm = await Swal.fire({ title: 'Hapus data?', text: "Data tidak bisa dikembalikan!", icon: 'warning', showCancelButton: true });
    if (confirm.isConfirmed) {
        const res = await CONFIG.postData(table, 'delete', {}, id);
        if (res.status === 'success') {
            Utils.alert('Terhapus', 'Data berhasil dibuang');
            loadModule(table);
        }
    }
}

async function searchData(table, query) {
    if (query.length > 2 || query.length === 0) {
        const data = await CONFIG.getData(table, "read", query);
        renderTable(table, data);
    }
}

function logout() {
    localStorage.removeItem('userCRM');
    window.location.href = "login.html";
}
