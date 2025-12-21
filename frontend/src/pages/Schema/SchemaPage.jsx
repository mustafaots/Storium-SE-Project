import { useEffect, useState } from 'react';
import { FaBorderAll, FaBoxes, FaCubes, FaLayerGroup, FaMapMarkerAlt, FaProjectDiagram, FaWarehouse } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './SchemaPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

function SchemaPage() {
    const activeItem = useActiveNavItem();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const resp = await fetch(`${API_BASE_URL}/schema/stats`);
                const data = await resp.json();
                if (data.success) {
                    setStats(data.data);
                } else {
                    setError(data.error || 'Failed to load stats');
                }
            } catch (err) {
                setError(err?.message || 'Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { key: 'locations', label: 'Locations', icon: FaMapMarkerAlt, color: '#FFD700' },
        { key: 'depots', label: 'Depots', icon: FaWarehouse, color: '#4CAF50' },
        { key: 'aisles', label: 'Aisles', icon: FaProjectDiagram, color: '#2196F3' },
        { key: 'racks', label: 'Racks', icon: FaLayerGroup, color: '#9C27B0' },
        { key: 'slots', label: 'Slots', icon: FaBorderAll, color: '#FF5722' },
        { key: 'stocks', label: 'Active Stocks', icon: FaBoxes, color: '#00BCD4' },
        { key: 'products', label: 'Products', icon: FaCubes, color: '#E91E63' }
    ];

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                <div className={styles.schemaContent}>
                    <h1 className={styles.title}>SCHEMA OVERVIEW</h1>
                    <p className={styles.subtitle}>Inventory structure at a glance</p>

                    {loading && <p className={styles.loadingText}>Loading statistics...</p>}
                    {error && <p className={styles.errorText}>{error}</p>}

                    {!loading && stats && (
                        <div className={styles.statsGrid}>
                            {statCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div key={card.key} className={styles.statCard}>
                                        <div className={styles.statIcon} style={{ background: card.color }}>
                                            <Icon size={24} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{stats[card.key] ?? 0}</span>
                                            <span className={styles.statLabel}>{card.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className={styles.actions}>
                        <button
                            className={styles.manageButton}
                            onClick={() => navigate('/locations')}
                        >
                            <span className={styles.btnIcon}><FaMapMarkerAlt /></span>
                            <span className={styles.btnText}>Manage Locations</span>
                            <span className={styles.btnArrow}>→</span>
                        </button>
                    </div>
                </div>
            </div>
            <NavBar activeItem={activeItem} />
        </div>
    );
}

export default SchemaPage;