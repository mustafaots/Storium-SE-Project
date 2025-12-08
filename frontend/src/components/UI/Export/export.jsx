import React from 'react';
import { FaFileCsv, FaFilePdf } from 'react-icons/fa';
import styles from './Export.module.css';

const ExportModal = ({ isOpen, onClose, onExportCSV, onExportPDF }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3>Choose Export Format</h3>
                <p>Select how you want to export your table:</p>
                
                <div className={styles.exportOptions}>
                    <button 
                        className={styles.exportOptionBtn}
                        onClick={onExportCSV}
                    >
                        <FaFileCsv className={styles.exportOptionIcon} />
                        <span>Export as CSV</span>
                        <small>Best for Excel & spreadsheets</small>
                    </button>
                    
                    <button 
                        className={styles.exportOptionBtn}
                        onClick={onExportPDF}
                    >
                        <FaFilePdf className={styles.exportOptionIcon} />
                        <span>Export as PDF</span>
                        <small>Best for printing & sharing</small>
                    </button>
                </div>
                
                <button 
                    className={styles.cancelBtn}
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ExportModal;