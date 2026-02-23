// config.js
const CONFIG = {
    // Masukkan URL Web App Google Apps Script kamu di sini
    API_URL: "https://script.google.com/macros/s/AKfycbxAf69MBsR0OOxBQeCdmXECZkiOeolazQ_gQu-UIABnEnRXZSAduAK6AqXahUpjgc6fnA/exec",
    
    // Fungsi helper untuk fetch data (POST)
    postData: async (table, action, data = {}, id = null) => {
        const payload = { table, action, data, id };
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify(payload)
        });
        return await response.json();
    },

    // Fungsi helper untuk ambil data (GET)
    // Perbaikan di config.js
getData: async (table, action = "read", query = "") => {
    const url = `${CONFIG.API_URL}?table=${table}&action=${action}&query=${query}`;
    
    // Jangan tambahkan header atau mode aneh-aneh
    const response = await fetch(url, {
        method: "GET",
        redirect: "follow" // INI KUNCINYA
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    return await response.json();
}
};
