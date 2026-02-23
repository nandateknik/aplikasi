// Fungsi Global untuk Header & Footer PDF
window.docTemplate = {
    header: (doc, title, noDoc) => {
        // Logo atau Nama Perusahaan
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");
        doc.text(CONFIG.APP_NAME, 14, 22);
        
        // Garis Header
        doc.setLineWidth(0.5);
        doc.line(14, 30, 196, 30);

        // Judul Dokumen (NOTA / PENAWARAN)
        doc.setFontSize(14);
        doc.text(title, 196, 22, { align: "right" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("No: " + noDoc, 196, 27, { align: "right" });
        
        // Info Perusahaan (Static)
        doc.setFontSize(9);
        doc.text("Jl. Tech No. 404, Kota Digital", 14, 37);
        doc.text("WA: 0812-3456-7890 | Email: support@servis.com", 14, 42);
    },
    
    footer: (doc) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text("Terima kasih atas kepercayaan Anda.", 14, 285);
            doc.text("Halaman " + String(i) + " dari " + String(pageCount), 196, 285, { align: "right" });
        }
    }
};
