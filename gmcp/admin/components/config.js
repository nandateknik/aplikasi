// config.js
const CONFIG = {
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzbcLtvoV8JWqgkxgSyF-g6YwnfAxAQcAYYgtwCi7fu3rh5T67kpOlqyOWsnzXKCAWl/exec",
    
    checkAuth: () => {
        const savedUser = localStorage.getItem('user_login');
        
        // 1. Jika tidak ada data login sama sekali
        if (!savedUser) {
            window.location.href = 'index.html';
            return;
        }

        const user = JSON.parse(savedUser);

        // 2. Validasi Role: Cek apakah jabatan mengandung kata 'admin'
        // Kita pakai .toLowerCase() supaya 'Admin', 'ADMIN', atau 'administrator' semua lolos
        const isAdmin = user.jabatan && user.jabatan.toLowerCase().includes('admin');

        if (!isAdmin) {
            // Jika dia login tapi BUKAN admin, lempar ke halaman penilaian (untuk user biasa)
            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak',
                text: 'Halaman ini hanya untuk Administrator!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'penilaian.html';
            });
            return;
        }

        // Jika lolos semua, return data user untuk dipakai di UI
        return user;
    },

    logout: () => {
        localStorage.removeItem('user_login');
        window.location.href = 'login.html';
    }
};

// Langsung jalankan saat script dimuat
CONFIG.checkAuth();
