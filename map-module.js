const MapModule = {
    map: null,
    marker: null,

    init() {
        this.map = L.map('map').setView([CONFIG.KANTOR_COORDS.lat, CONFIG.KANTOR_COORDS.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        
        L.Control.geocoder({ defaultMarkGeocode: false, placeholder: "Cari Lokasi/Jalan..." })
            .on('markgeocode', (e) => {
                const center = e.geocode.center;
                this.map.setView(center, 16);
                this.marker.setLatLng(center);
                this.updateLocation(center.lat, center.lng);
            }).addTo(this.map);

        this.marker = L.marker([CONFIG.KANTOR_COORDS.lat, CONFIG.KANTOR_COORDS.lng], {draggable: true}).addTo(this.map);
        this.marker.on('dragend', (e) => this.updateLocation(e.target.getLatLng().lat, e.target.getLatLng().lng));
    },

    updateLocation(lat, lng) {
        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lng;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(r => r.json()).then(d => {
                document.getElementById('alamat').value = d.display_name;
                BookingModule.calculateAll();
            });
    },

    toggleMapSync() {
        const isSync = document.getElementById('useOldAddr').checked;
        const mapDiv = document.getElementById('mapContainer');
        if (isSync) {
            if(!BookingModule.currentCustomer) {
                Swal.fire('Info', 'Cari/Pilih pelanggan dulu', 'info');
                document.getElementById('useOldAddr').checked = false;
                return;
            }
            mapDiv.style.display = 'none';
            this.syncWithCustomer();
        } else {
            mapDiv.style.display = 'block';
            setTimeout(() => { this.map.invalidateSize(); }, 200);
        }
    },

    syncWithCustomer() {
        const user = BookingModule.currentCustomer;
        if (user) {
            document.getElementById('alamat').value = user.alamat;
            document.getElementById('lat').value = user.lat;
            document.getElementById('lng').value = user.lang;
            const latlng = [user.lat, user.lang];
            this.marker.setLatLng(latlng);
            this.map.setView(latlng, 16);
            BookingModule.calculateAll();
        }
    }
};
