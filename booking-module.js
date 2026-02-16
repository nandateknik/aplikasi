const BookingModule = {
    listPelanggan: [],
    selectedItems: [],
    bensinCost: 0,
    currentCustomer: null,

    initTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('tglBooking').value = now.toISOString().slice(0,16);
    },

    async loadInitialData() {
        try {
            const [resP, resJ] = await Promise.all([
                fetch(CONFIG.WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'getAllPelanggan' }) }),
                fetch(CONFIG.WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'getDaftarHarga' }) })
            ]);
            
            const dataP = await resP.json();
            if(dataP.success) {
                this.listPelanggan = dataP.data.map(r => ({
                    nama: r[0], email: r[1], wa: r[3], lat: r[4], lang: r[5], alamat: r[7]
                }));
                document.getElementById('emailList').innerHTML = this.listPelanggan.map(u => `<option value="${u.email}">${u.nama}</option>`).join('');
            }

            const dataJ = await resJ.json();
            if(dataJ.success) {
                document.getElementById('jasaSelect').innerHTML = dataJ.data.map(i => `<option value="${i[1]}">${i[0]}</option>`).join('');
            }
        } catch(e) { console.error("Load Error:", e) }
    },

    checkSelection() {
        const emailVal = document.getElementById('emailInput').value.toLowerCase();
        const user = this.listPelanggan.find(u => u.email.toLowerCase() === emailVal);
        
        if(user) {
            this.currentCustomer = user;
            document.getElementById('selectedName').innerText = user.nama;
            document.getElementById('selectedWA').innerText = user.wa;
            document.getElementById('customerBadge').classList.remove('d-none');
            if(document.getElementById('useOldAddr').checked) MapModule.syncWithCustomer();
        } else {
            this.currentCustomer = null;
            document.getElementById('customerBadge').classList.add('d-none');
        }
    },

    calculateAll() {
        const lat = document.getElementById('lat').value;
        const lng = document.getElementById('lng').value;
        if(!lat || !lng) return;
        
        const jarak = MapModule.map.distance([lat, lng], [CONFIG.KANTOR_COORDS.lat, CONFIG.KANTOR_COORDS.lng]) / 1000;
        document.getElementById('txtJarak').innerText = jarak.toFixed(1);
        
        this.bensinCost = (jarak > CONFIG.BENSIN.FREE_KM) ? Math.ceil(jarak - CONFIG.BENSIN.FREE_KM) * CONFIG.BENSIN.PER_KM_COST : 0;
        document.getElementById('txtBensin').innerText = "Rp " + this.bensinCost.toLocaleString();
        
        const totalJasa = this.selectedItems.reduce((acc, it) => acc + (it.harga * it.qty), 0);
        document.getElementById('txtTotal').innerText = "Rp " + (totalJasa + this.bensinCost).toLocaleString();
    },

    addItem() {
        const sel = document.getElementById('jasaSelect');
        const nama = sel.options[sel.selectedIndex].text;
        const harga = parseInt(sel.value);
        if(!harga) return;
        const idx = this.selectedItems.findIndex(i => i.nama === nama);
        if(idx > -1) this.selectedItems[idx].qty++;
        else this.selectedItems.push({nama, harga, qty: 1});
        this.renderItems();
    },

    addManualItem() {
        const nama = document.getElementById('manualNama').value;
        const harga = parseInt(document.getElementById('manualHarga').value);
        if(!nama || !harga) return Swal.fire('Error', 'Isi nama & harga', 'error');
        this.selectedItems.push({nama: "[M] " + nama, harga: harga, qty: 1});
        document.getElementById('manualNama').value = "";
        document.getElementById('manualHarga').value = "";
        this.renderItems();
    },

    renderItems() {
        document.getElementById('itemContainer').innerHTML = this.selectedItems.map((it, idx) => `
            <div class="d-flex justify-content-between align-items-center bg-white p-2 rounded-4 border mb-2 small shadow-sm">
                <div class="ps-2"><b>${it.nama}</b><br><span class="text-muted">Rp${it.harga.toLocaleString()} x ${it.qty}</span></div>
                <button class="btn btn-sm text-danger border-0" onclick="BookingModule.removeItem(${idx})"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
        this.calculateAll();
    },

    removeItem(idx) {
        this.selectedItems.splice(idx, 1);
        this.renderItems();
    },

    async submitBooking() {
        const email = document.getElementById('emailInput').value;
        const tgl = document.getElementById('tglBooking').value;
        const lat = document.getElementById('lat').value;
        
        if(!email || !tgl || this.selectedItems.length === 0 || !lat) {
            return Swal.fire('Error', 'Data belum lengkap', 'warning');
        }

        document.getElementById('loader').style.display = 'flex';
        const payload = {
            action: 'createNota',
            email: email,
            nama: this.currentCustomer ? this.currentCustomer.nama : "Pelanggan",
            tglPengerjaan: tgl.replace('T', ' '),
            items: this.selectedItems,
            total: this.selectedItems.reduce((acc, it) => acc + (it.harga * it.qty), 0) + this.bensinCost,
            lat: lat,
            lang: document.getElementById('lng').value,
            alamat: document.getElementById('alamat').value
        };

        try {
            const res = await fetch(CONFIG.WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
            const r = await res.json();
            document.getElementById('loader').style.display = 'none';
            if(r.success) {
                Swal.fire('Berhasil!', 'Work Order & Nota tersimpan', 'success').then(() => window.location.href = 'admin.html');
            } else {
                Swal.fire('Gagal', r.message, 'error');
            }
        } catch(e) {
            document.getElementById('loader').style.display = 'none';
            Swal.fire('Error', 'Server error / Periksa koneksi', 'error');
        }
    }
};
