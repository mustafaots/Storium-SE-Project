import React, { useState, useMemo } from 'react';
import { Search, MapPin, Box } from 'lucide-react';
import styles from './PlacementSearch.module.css';

const PlacementSearch = ({ data = [] }) => {
    const [query, setQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!query) return data;
        const lowerQuery = query.toLowerCase();
        return data.filter(item =>
            item.product.toLowerCase().includes(lowerQuery) ||
            item.rack_code.toLowerCase().includes(lowerQuery)
        );
    }, [data, query]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Product Placement</h3>
                <span className={styles.subtitle}>Find product locations</span>
            </div>

            <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search by product, rack..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.input}
                />
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Loc</th>
                            <th>Pos</th>
                            <th>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.slice(0, 50).map((item, i) => (
                            <tr key={i}>
                                <td className={styles.productCell}>
                                    <Box size={14} className={styles.icon} />
                                    <span>{item.product}</span>
                                </td>
                                <td className={styles.locCell}>{item.depot}<br /><span className={styles.rack}>{item.rack_code}</span></td>
                                <td className={styles.posCell}>
                                    <span className={styles.tag}>B{item.bay_no}-L{item.level_no}</span>
                                </td>
                                <td className={styles.qtyCell}>{item.quantity}</td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr><td colSpan="4" className={styles.empty}>No matches found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlacementSearch;
