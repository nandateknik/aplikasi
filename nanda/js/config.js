// File: js/config.js

// 1. URL API Utama
const API_URL = 'https://script.google.com/macros/s/AKfycbwT5oqsEkvqyUs9qRBZON9rpU2ynial0AKV2lzSRtAFrYdN6GdWm6NQPLlpfAsxSapE/exec';

// 2. State Management (Penyimpanan Data Global)
// Menggunakan object agar nantinya gampang ditambah untuk Penawaran, Invoice, dll.
const AppState = {
    dataPelanggan: [],
    dataPenawaran: [], // Persiapan untuk fitur selanjutnya
    dataSPK: [],       // Persiapan untuk fitur selanjutnya
};
