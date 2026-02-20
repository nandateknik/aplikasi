/**
 * CONFIGURATION FILE - NANDA TEKNIK BANYUWANGI
 * File iki dadi pusat pengaturan URL API lan Identitas
 */

const CONFIG = {
    // 1. URL Web App soko Apps Script (Ganti karo URL Deployment-mu sing anyar)
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbx7XdXXusDSkurHqTynBRMxLBGg_Q_f18YGUVJ1VX7ca0o6-VMmSpbGwZzH5VqFsWJP/exec",

    // 2. Pengaturan Maps & Kantor
    KANTOR_COORDS: {
        lat: -8.1965, // Contoh koordinat Banyuwangi, sesuaikan karo lokasi kantormu
        lng: 114.3734
    },

    // 3. Identitas Bengkel / Usaha (Kanggo Nota PDF & Header)
    BRAND: {
        name: "NANDA TEKNIK BANYUWANGI",
        tagline: "Software, Network & Electrical Engineering",
        address: "Sukowidi Indah Residence D5, Banyuwangi - Jawa Timur. 68421",
        whatsapp: "6281234567890", // Format kudu 62...
        email: "nandateknik@gmail.com",
        logo: "assets/img/logo-none-text.png", // Pastikan path file bener
        bank_info: "BCA a/n Nanda Krisbianto - 1801826011"
    },

    // 4. Pengaturan Sistem
    CURRENCY: "IDR",
    DATE_FORMAT: "id-ID",
};

// Cek nek URL isih bawaan contoh, dadi pengeling
if (CONFIG.WEB_APP_URL.includes("AKfycb...")) {
    console.warn("PERINGATAN: WEB_APP_URL isih nganggo contoh! Ganti karo URL Deployment Apps Script-mu.");
}
