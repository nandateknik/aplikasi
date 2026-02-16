// CONFIGURASI NANDA TEKNIK
// Nganggo pengecekan supaya ora error pas dipanggil bolak-balik
if (typeof CONFIG === 'undefined') {
    var CONFIG = {
        // URL Google Apps Script
        WEB_APP_URL: 'https://script.google.com/macros/s/AKfycby7BdaVZzqBYQNaIc8qD2AojHWH-oXY3FzFUSfp8L2Zp83CMK2Q1oihCyPxKvh8Lwza/exec',
        
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
