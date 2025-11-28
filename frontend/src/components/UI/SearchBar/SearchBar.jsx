import { FaSearch } from 'react-icons/fa';
import styles from './SearchBar.module.css';

const SearchBar = ()=>{
    return (
    
    <div className={styles.searchBox}>
        <FaSearch className={styles.searchIcon} />
        <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
        />
    </div>
    
    );
}

export default SearchBar;