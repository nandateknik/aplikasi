function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("LAPORAN DATA PRODUK", 14, 15);
    
    // Ambil data dari IndexedDB
    db.products.toArray().then(products => {
        const body = products.map(p => [p.id, p.nama, p.harga, p.stock]);
        doc.autoTable({
            head: [['ID', 'Nama Barang', 'Harga', 'Stok']],
            body: body,
            startY: 20
        });
        doc.save("daftar_produk.pdf");
    });
}
