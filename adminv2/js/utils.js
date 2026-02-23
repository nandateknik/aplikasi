/**
 * CRM Jasa Servis - Utils Module
 * Fitur: PDF Generator, Email Engine, WhatsApp Integration, & Formatters
 */

const Utils = {
    // 1. FORMATTER: Mengubah angka ke Rupiah (Rp)
    formatRupiah: (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    },

    // 2. FORMATTER: Tanggal cantik (Indonesian Style)
    formatTanggal: (dateString) => {
        const opsi = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', opsi);
    },

    // 3. GENERATE PDF: Nota & Penawaran
    // Fungsi ini akan membungkus konten dalam template invoice yang cantik sebelum di-download
    generatePDF: async (data, type = "NOTA") => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');

        // Membuat container sementara untuk render HTML
        const element = document.createElement('div');
        element.style.width = '550px';
        element.style.padding = '20px';
        element.style.fontFamily = 'Arial, sans-serif';
        
        const items = JSON.parse(data.items_json || '[]');
        let rows = items.map(item => `
            <tr>
                <td style="border-bottom: 1px solid #eee; padding: 10px;">${item.name}</td>
                <td style="border-bottom: 1px solid #eee; padding: 10px; text-align: right;">${Utils.formatRupiah(item.price)}</td>
            </tr>
        `).join('');

        element.innerHTML = `
            <div style="border: 1px solid #ddd; padding: 30px; border-radius: 10px;">
                <h2 style="color: #6366f1; margin-bottom: 5px;">${type} PEMBAYARAN</h2>
                <p style="font-size: 12px; color: #777;">ID: ${data.id} | Tanggal: ${Utils.formatTanggal(data.tanggal)}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr>
                        <td><strong>Kepada:</strong><br>${data.email}</td>
                        <td style="text-align: right;"><strong>Dari:</strong><br>Unit Servis Pro</td>
                    </tr>
                </table>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8fafc;">
                            <th style="text-align: left; padding: 10px;">Deskripsi</th>
                            <th style="text-align: right; padding: 10px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>

                <div style="text-align: right; margin-top: 30px;">
                    <h3 style="color: #6366f1;">Total: ${Utils.formatRupiah(data.total)}</h3>
                </div>
                
                <div style="margin-top: 50px; font-size: 10px; color: #aaa; text-align: center;">
                    Terima kasih telah mempercayai jasa kami. Harap simpan nota ini sebagai bukti garansi.
                </div>
            </div>
        `;

        document.body.appendChild(element); // Append sebentar untuk rendering

        await doc.html(element, {
            callback: function (doc) {
                doc.save(`${type}_${data.id}.pdf`);
                document.body.removeChild(element); // Hapus kembali
            },
            x: 20,
            y: 20,
            width: 550,
            windowWidth: 800
        });
    },

    // 4. EMAIL ENGINE: Kirim Email Profesional
    sendEmail: (data, type = "NOTA") => {
        const subject = `${type} Servis - ${data.id}`;
        const body = `Halo,
        
Terima kasih telah menggunakan jasa kami.
Berikut adalah rincian ${type.toLowerCase()} Anda:

Nomor: ${data.id}
Tanggal: ${Utils.formatTanggal(data.tanggal)}
Total: ${Utils.formatRupiah(data.total)}

Silakan hubungi kami jika ada pertanyaan lebih lanjut.

Salam,
Admin CRM Servis`;

        const mailtoLink = `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    },

    // 5. WHATSAPP INTEGRATION
    sendWhatsApp: (phone, message) => {
        // Bersihkan nomor (hilangkan simbol +, -, dll)
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
        
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    },

    // 6. NOTIFICATION: SweetAlert Helper
    alert: (title, text, icon = 'success') => {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonColor: '#6366f1',
            borderRadius: '15px'
        });
    }
};
