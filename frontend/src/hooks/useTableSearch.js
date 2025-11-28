import { useState, useEffect } from 'react';

// Generic search hook that any table can use
export const useTableSearch = (defaultTerm = '') => {
  const [searchTerm, setSearchTerm] = useState(defaultTerm);
  const [debouncedSearch, setDebouncedSearch] = useState(defaultTerm);

  // Debounce search term (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  return {
    // State
    searchTerm,
    debouncedSearch,
    
    // Actions
    setSearchTerm: handleSearchChange,
    clearSearch,
    
    // Derived values
    isSearching: searchTerm.length > 0,
    hasSearchResults: debouncedSearch.length > 0
  };
};

export default useTableSearch;