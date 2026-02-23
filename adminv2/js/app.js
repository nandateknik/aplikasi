const menus = [
    { id: 'Pelanggan', icon: 'bi-people', label: 'Pelanggan' },
    { id: 'Booking', icon: 'bi-calendar-event', label: 'Booking' },
    { id: 'Nota', icon: 'bi-file-earmark-text', label: 'Nota' },
    { id: 'Labarugi', icon: 'bi-graph-up-arrow', label: 'Laba Rugi' },
    { id: 'Settings', icon: 'bi-gear', label: 'Settings' }
];

document.addEventListener('DOMContentLoaded', () => {
    renderMenus();
    loadModule('Pelanggan'); // Default page
});

function renderMenus() {
    const mobileContainer = document.getElementById('menuMobile');
    const desktopContainer = document.getElementById('menuDesktop');

    menus.forEach(m => {
        // Mobile
        mobileContainer.innerHTML += `
            <a href="#" onclick="loadModule('${m.id}')" id="m-${m.id}">
                <i class="bi ${m.icon}"></i>
                <span>${m.label}</span>
            </a>`;
        
        // Desktop
        desktopContainer.innerHTML += `
            <a href="#" class="list-group-item list-group-item-action border-0 py-3" onclick="loadModule('${m.id}')">
                <i class="bi ${m.icon} me-2"></i> ${m.label}
            </a>`;
    });
}

async function loadModule(moduleName) {
    document.getElementById('pageTitle').innerText = moduleName;
    const content = document.getElementById('mainContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';

    try {
        const data = await CONFIG.getData(moduleName);
        renderTable(moduleName, data);
    } catch (e) {
        content.innerHTML = `<div class="alert alert-danger">Gagal memuat data ${moduleName}</div>`;
    }
}

function renderTable(name, data) {
    const content = document.getElementById('mainContent');
    if (!data || data.length === 0) {
        content.innerHTML = '<div class="text-center p-5">Data Kosong</div>';
        return;
    }

    // Tampilan Mobile Card atau Desktop Table bisa disesuaikan di sini
    let html = `<div class="row">`;
    data.forEach(item => {
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card card-mobile p-3">
                    <div class="d-flex justify-content-between">
                        <h6 class="fw-bold">${item.nama || item.id || 'No Name'}</h6>
                        <span class="badge bg-success">${item.status || 'Aktif'}</span>
                    </div>
                    <p class="small text-muted mb-2">${item.email || item.tanggal || ''}</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="editData('${name}', '${item.id}')"><i class="bi bi-pencil"></i></button>
                        ${name === 'Nota' ? `<button class="btn btn-sm btn-danger" onclick="Utils.generatePDF('mainContent', 'Nota-${item.id}')"><i class="bi bi-file-pdf"></i></button>` : ''}
                    </div>
                </div>
            </div>`;
    });
    html += `</div>`;
    content.innerHTML = html;
}
