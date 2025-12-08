import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

/**
 * Export data as CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name for the downloaded file
 */
export const exportToCSV = (data, filename = 'export') => {
    try {
        // Convert data to CSV format
        const csv = Papa.unparse(data);
        
        // Create a Blob with the CSV data
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        
        // Create a temporary download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { success: true };
    } catch (error) {
        console.error('Error exporting CSV:', error);
        return { success: false, error };
    }
};

/**
 * Export data as PDF file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column headers
 * @param {string} title - Title for the PDF document
 * @param {string} filename - Name for the downloaded file
 */



export const exportToPDF = (data, columns, title = 'Report', filename = 'export') => {
    try {
        // Create new PDF document
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        
        // Add generation date
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
        
        // Prepare table data - convert objects to arrays
        const tableData = data.map(item => 
            columns.map(col => item[col.key] || '')
        );
        
        // Prepare headers
        const headers = [columns.map(col => col.label)];
        
        // Generate the table using the jspdf-autotable plugin attached to the jsPDF instance
        // some bundlers attach the plugin to the doc as `doc.autoTable`
        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: 40,
                theme: 'striped',
                headStyles: { 
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: { 
                    fontSize: 9,
                    cellPadding: 3
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }
            });
        } else {
            // Fallback: try calling autoTable as a global function (older setups)
            if (typeof window !== 'undefined' && typeof window.autoTable === 'function') {
                window.autoTable(doc, {
                    head: headers,
                    body: tableData,
                    startY: 40,
                    theme: 'striped',
                    headStyles: { 
                        fillColor: [41, 128, 185],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    styles: { 
                        fontSize: 9,
                        cellPadding: 3
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    }
                });
            } else {
                // If autoTable is not available, throw an informative error so caller can catch it
                throw new Error('jspdf-autotable plugin is not loaded. Ensure "jspdf-autotable" is installed and imported.');
            }
        }
        // Save the PDF
        doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
        
        return { success: true };
    } catch (error) {
        // console.error('Error exporting PDF:', error);
        return { success: false, error };
    }
};

/**
 * Prepare data for export by mapping to desired format
 * @param {Array} data - Raw data array
 * @param {Object} mapping - Object mapping new keys to old keys
 * @returns {Array} Formatted data ready for export
 */
export const prepareDataForExport = (data, mapping) => {
    return data.map(item => {
        const formattedItem = {};
        Object.keys(mapping).forEach(newKey => {
            const oldKey = mapping[newKey];
            formattedItem[newKey] = item[oldKey] || '';
        });
        return formattedItem;
    });
};