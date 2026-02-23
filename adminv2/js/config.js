// config.js
const CONFIG = {
    // Masukkan URL Web App Google Apps Script kamu di sini
    API_URL: "https://script.google.com/macros/s/AKfycbyHnaOwwdv1nNoia9WTJAnXHzDzfIQq1FAElE4rPey4d5AfOv3sBJJWFvHmtiymxQiwfQ/exec",
    
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
    const response = await fetch(url, {
        method: "GET",
        mode: "cors", // Tambahkan mode cors
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
    });
    return await response.json();
}
};
