// Export Utilities
// Path: frontend/src/utils/exportUtils.js

import jsPDF from 'jspdf';
import autoTableImport from 'jspdf-autotable';
import Papa from 'papaparse';

const safeAutoTable = (doc, options) => {
    if (typeof doc.autoTable === 'function') {
        doc.autoTable(options);
        return;
    }
    const autoTableFn =
        typeof autoTableImport === 'function'
            ? autoTableImport
            : autoTableImport && typeof autoTableImport.default === 'function'
                ? autoTableImport.default
                : null;
    if (autoTableFn) {
        autoTableFn(doc, options);
        return;
    }
    if (typeof window !== 'undefined' && typeof window.autoTable === 'function') {
        window.autoTable(doc, options);
        return;
    }
    throw new Error('PDF export failed: jspdf-autotable plugin is not available.');
};

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file
 */
export const exportToCSV = (data, fileName = 'storium-report') => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Export data to PDF report
 * @param {Object} reportData - Object containing report sections
 * @param {string} title - Report title
 */
export const exportToPDF = (reportData, title = 'Storium Analytics Report') => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Primary Color
    doc.text('STORIUM IMS', 14, 22);

    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text(title, 14, 32);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

    let currentY = 50;

        // KPIs Section
        if (reportData.kpis) {
            doc.setFontSize(12);
            doc.setTextColor(31, 41, 55);
            doc.text('Key Performance Indicators', 14, currentY);
            currentY += 10;

            const kpiData = [
                ['Total Stock Value', `$${(reportData.kpis.totalStockValue ?? 0).toLocaleString?.() ?? reportData.kpis.totalStockValue ?? 0}`],
                ['Movements Today', reportData.kpis.movementsToday ?? 0],
                ['Below Min Level', reportData.kpis.belowMinLevel ?? 0],
                ['Warehouse Occupancy', `${reportData.kpis.warehouseOccupancy ?? 0}%`]
            ];

            safeAutoTable(doc, {
                startY: currentY,
                head: [['Metric', 'Value']],
                body: kpiData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });

            currentY = (doc.lastAutoTable?.finalY || currentY) + 15;
        }

        // Category Distribution Section
        if (reportData.categories) {
            doc.text('Inventory by Category', 14, currentY);
            currentY += 5;

            const categoryData = reportData.categories.map(c => [
                c.name,
                `$${(c.value ?? 0).toLocaleString?.() ?? c.value ?? 0}`
            ]);

            safeAutoTable(doc, {
                startY: currentY,
                head: [['Category', 'Stock Value']],
                body: categoryData,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] }
            });

            currentY = (doc.lastAutoTable?.finalY || currentY) + 15;
        }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Page ${i} of ${pageCount} | Storium Inventory Management System`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

        doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        throw error;
    }
};
