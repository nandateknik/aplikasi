const Utils = {
    // Generate PDF Nota/Penawaran
    generatePDF: async (elementId, filename) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        const element = document.getElementById(elementId);
        
        await doc.html(element, {
            callback: function (doc) {
                doc.save(filename + '.pdf');
            },
            x: 15,
            y: 15,
            width: 560,
            windowWidth: 800
        });
    },

    // Kirim Email via Mailto (Gratis & Cepat)
    sendEmail: (to, subject, body) => {
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }
};
