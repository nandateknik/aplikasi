// config.js
const CONFIG = {
    // Masukkan URL Web App Google Apps Script kamu di sini
    API_URL: "https://script.google.com/macros/s/AKfycbx2l0uhZFnykDmLSrqnkw2RQjE8OmRmyC9TXpwUO3_ELMntE_U96FJ1nDBaGqvIdA3YzA/exec",
    
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
    getData: async (table, action = "read", query = "") => {
        const url = `${CONFIG.API_URL}?table=${table}&action=${action}&query=${query}`;
        const response = await fetch(url);
        return await response.json();
    }
};
