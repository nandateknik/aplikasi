// js/layout.js
const renderLayout = () => {
    const path = window.location.pathname;
    let page = path.split("/").pop() || "index.html";
    
    // Jika path kosong atau hanya "/", anggap index.html
    if (page === "" || page === "/") page = "index.html";

    const sidebarContent = `
        <div id="sidebar" class="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-50 transition-transform duration-300 sidebar-hidden lg:sidebar-active lg:translate-x-0">
            <div class="p-6 flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">P</div>
                <span class="text-white font-black text-xl tracking-tighter">POS<span class="text-blue-500">PRO</span></span>
            </div>
            
            <nav class="mt-6 px-4 space-y-2">
                <a href="index.html" class="flex items-center gap-3 p-3 rounded-xl transition-all ${page === 'index.html' ? 'nav-link-active bg-blue-600/10 text-blue-500' : 'hover:bg-slate-800'}">
                    <span>📊</span> <span class="text-sm font-bold">Dashboard</span>
                </a>
                <a href="kasir.html" class="flex items-center gap-3 p-3 rounded-xl transition-all ${page === 'kasir.html' ? 'nav-link-active bg-blue-600/10 text-blue-500' : 'hover:bg-slate-800'}">
                    <span>🛒</span> <span class="text-sm font-bold">Mesin Kasir</span>
                </a>
                <a href="product.html" class="flex items-center gap-3 p-3 rounded-xl transition-all ${page === 'product.html' ? 'nav-link-active bg-blue-600/10 text-blue-500' : 'hover:bg-slate-800'}">
                    <span>📦</span> <span class="text-sm font-bold">Stok Produk</span>
                </a>
                <a href="gudang.html" class="flex items-center gap-3 p-3 rounded-xl transition-all ${page === 'gudang.html' ? 'nav-link-active bg-blue-600/10 text-blue-500' : 'hover:bg-slate-800'}">
                    <span>🏭</span> <span class="text-sm font-bold">Gudang</span>
                </a>
                <a href="riwayat.html" class="flex items-center gap-3 p-3 rounded-xl transition-all ${page === 'riwayat.html' ? 'nav-link-active bg-blue-600/10 text-blue-500' : 'hover:bg-slate-800'}">
                    <span>📜</span> <span class="text-sm font-bold">Log Transaksi</span>
                </a>
                <a href="laporan.html" class="flex items-center gap-3 p-3 rounded-xl transition-all ${page === 'laporan.html' ? 'nav-link-active bg-blue-600/10 text-blue-500' : 'hover:bg-slate-800'}">
                    <span>📈</span> <span class="text-sm font-bold">Laporan Laba</span>
                </a>
                
                <hr class="border-slate-800 my-4">
                
                <a href="settings.html" class="flex items-center gap-3 p-3 rounded-xl transition-all ${page === 'settings.html' ? 'nav-link-active bg-blue-600/10 text-blue-500' : 'hover:bg-slate-800'}">
                    <span>⚙️</span> <span class="text-sm font-bold">Pengaturan</span>
                </a>
            </nav>
        </div>
    `;

    const headerContent = `
        <header class="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
            <button onclick="toggleSidebar()" class="lg:hidden p-2 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div class="flex-1 lg:flex-none"></div>
            <div class="flex items-center gap-4">
                <div class="text-right hidden sm:block">
                    <div id="user-name" class="text-xs font-black text-slate-800 uppercase">User Name</div>
                    <div id="user-role" class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Role</div>
                </div>
                <button onclick="logout()" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                    🚪
                </button>
            </div>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarContent);
    const headerEl = document.getElementById('layout-header');
    if (headerEl) headerEl.innerHTML = headerContent;
};

// --- PWA (AUTOMATIC) ---
const initPWA = () => {
    if (!document.querySelector('link[rel="manifest"]')) {
        const manifest = document.createElement('link');
        manifest.rel = 'manifest';
        manifest.href = './manifest.json';
        document.head.appendChild(manifest);
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log("PWA: Service Worker Active"))
            .catch(err => console.error("PWA: Error", err));
    }
};

window.toggleSidebar = () => {
    const sb = document.getElementById('sidebar');
    if (sb) {
        sb.classList.toggle('sidebar-hidden');
        sb.classList.toggle('translate-x-0');
    }
};

// Fungsi Logout
window.logout = () => {
    if(confirm("Apakah Anda ingin keluar?")) {
        localStorage.removeItem('session');
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderLayout();
    initPWA();
    
    // Ambil session dari localStorage
    const savedSession = localStorage.getItem('session');
    if(savedSession) {
        const session = JSON.parse(savedSession);
        const nameEl = document.getElementById('user-name');
        const roleEl = document.getElementById('user-role');
        if(nameEl) nameEl.innerText = session.nama;
        if(roleEl) roleEl.innerText = session.role;
    }
});
