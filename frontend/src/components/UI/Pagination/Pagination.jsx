import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = ''
}) => {

  // Page size options shown in the dropdown
  const pageSizes = [5, 10, 20, 30, 40, 50, 100];

  const showPagination = totalItems >= 5;
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    onPageSizeChange(newSize);
  };

  if (!showPagination) return null;

  return (
    <div className={`${styles.pagination} ${className}`}>
      <div className={styles.paginationControls}>
        <button
          className={styles.paginationButton}
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        <span className={styles.pageInfo}>
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>
        
        <button
          className={styles.paginationButton}
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
      
      <div className={styles.pageSizeSelector}>
        <label htmlFor="pageSize">Show:</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={handlePageSizeChange}
          className={styles.pageSizeSelect}
        >
          {pageSizes.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;