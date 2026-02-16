// CONFIGURASI NANDA TEKNIK
// Nganggo pengecekan supaya ora error pas dipanggil bolak-balik
if (typeof CONFIG === 'undefined') {
    var CONFIG = {
        // URL Google Apps Script
        WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbw0z5YznKUin3ElHIyp4S_kzjU_piLmZlTZA3T8ieTS8KQJ-dah7RMQ0k8vjKDj5Kzk/exec',
        
        // Koordinat Kantor (Pusat)
        KANTOR_COORDS: { 
            lat: -8.1910395, 
            lng: 114.3697974 
        },
        
        // Settingan Biaya Bensin
        BENSIN: {
            FREE_KM: 5,        // Gratis biaya bensin nek kurang saka 5km
            PER_KM_COST: 10000 // Biaya per km sakwise 5km
        }
    };
}
