import { useState } from 'react';
import styles from './Settings.module.css';
import Button from '../../components/UI/Button/Button.jsx';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import {FaCompass} from 'react-icons/fa';

function SettingsPage() {
    const activeItem = useActiveNavItem();

    const simpleNavItems = [ 
        {
            name: 'Menu',
            icon: <FaCompass/>,
            path: '/'
        },
    ];

    // Inventory & Location Control State
    const [inventorySettings, setInventorySettings] = useState({
    singleLocationPerItem: true,
    singleDepotPerLocation: true,
    allowNegativeStock: false,
    });

    // Preferences State
    const [preferences, setPreferences] = useState({
    measurementUnit: 'metric',
    dateFormat: 'DDMMYYYY',
    currency: 'USD',
    language: 'en'
    });

    // Forecasting & Alerts State
    const [alerts, setAlerts] = useState({
    understock: true,
    overstock: true,
    expiry: true,
    lowStock: true,
    stockout: true,
    customThresholds: {}
    });

    const handleInventoryChange = (key, value) => {
    setInventorySettings(prev => ({
    ...prev,
    [key]: value
    }));
    };

    const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
    ...prev,
    [key]: value
    }));
    };

    const handleAlertChange = (key, value) => {
    setAlerts(prev => ({
    ...prev,
    [key]: value
    }));
    };

    const saveSettings = () => {
    const settings = {
    inventory: inventorySettings,
    preferences,
    alerts
    };
    localStorage.setItem('storiumSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
    };

    return (
    <div className={styles.settingsPage}>
    <div className={styles.header}>
    <h1 className={styles.title}>Settings</h1>
    <p className={styles.subtitle}>Configure your system preferences</p>
    </div>

    <div className={styles.settingsGrid}>
        {/* Inventory & Location Control */}
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Inventory & Location Control</h2>
            <div className={styles.divider}></div>
            </div>

            <div className={styles.settingsList}>
            {/* Single Location */}
            <div className={styles.settingRow}>
                <div className={styles.checkboxWrapper}>
                <input
                    type="checkbox"
                    id="single-location"
                    className={styles.checkbox}
                    checked={inventorySettings.singleLocationPerItem}
                    onChange={(e) => handleInventoryChange('singleLocationPerItem', e.target.checked)}
                />
                </div>
                <div className={styles.settingInfo}>
                <label htmlFor="single-location" className={styles.settingLabel}>
                    Limit items to single location
                </label>
                <p className={styles.settingDesc}>
                    Each item can only be stored in one location
                </p>
                </div>
                <div className={styles.settingControl}></div>
            </div>

            {/* One Depot */}
            <div className={styles.settingRow}>
                <div className={styles.checkboxWrapper}>
                <input
                    type="checkbox"
                    id="one-depot"
                    className={styles.checkbox}
                    checked={inventorySettings.singleDepotPerLocation}
                    onChange={(e) => handleInventoryChange('singleDepotPerLocation', e.target.checked)}
                />
                </div>
                <div className={styles.settingInfo}>
                <label htmlFor="one-depot" className={styles.settingLabel}>
                    One depot per location
                </label>
                <p className={styles.settingDesc}>
                    Each location can have only one depot
                </p>
                </div>
                <div className={styles.settingControl}></div>
            </div>

            {/* Negative Stock */}
            <div className={styles.settingRow}>
                <div className={styles.checkboxWrapper}>
                <input
                    type="checkbox"
                    id="negative-stock"
                    className={styles.checkbox}
                    checked={inventorySettings.allowNegativeStock}
                    onChange={(e) => handleInventoryChange('allowNegativeStock', e.target.checked)}
                />
                </div>
                <div className={styles.settingInfo}>
                <label htmlFor="negative-stock" className={styles.settingLabel}>
                    Allow negative stock
                </label>
                <p className={styles.settingDesc}>
                    Permit inventory levels below zero
                </p>
                </div>
                <div className={styles.settingControl}></div>
            </div>

        </div>
    </section>

    {/* Preferences */}
    <section className={styles.section}>
        <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Preferences</h2>
        <div className={styles.divider}></div>
        </div>

        <div className={styles.settingsList}>
        {/* Measurement Units */}
        <div className={styles.settingRow}>
            <div className={styles.checkboxWrapper}></div>
            <div className={styles.settingInfo}>
            <label htmlFor="measurement-unit" className={styles.settingLabel}>
                Measurement Units
            </label>
            <p className={styles.settingDesc}>
                Choose your preferred unit system for measurements
            </p>
            </div>
            <div className={styles.settingControl}>
            <div className={styles.selectWrapper}>
                <select
                id="measurement-unit"
                className={styles.select}
                value={preferences.measurementUnit}
                onChange={(e) => handlePreferenceChange('measurementUnit', e.target.value)}
                >
                <option value="metric">Metric (kg, cm, m³)</option>
                <option value="imperial">Imperial (lb, in, ft³)</option>
                </select>
            </div>
            </div>
        </div>

        {/* Date Format */}
        <div className={styles.settingRow}>
            <div className={styles.checkboxWrapper}></div>
            <div className={styles.settingInfo}>
            <label htmlFor="date-format" className={styles.settingLabel}>
                Date Format
            </label>
            <p className={styles.settingDesc}>
                Choose how dates should be displayed throughout the system
            </p>
            </div>
            <div className={styles.settingControl}>
            <div className={styles.selectWrapper}>
                <select
                id="date-format"
                className={styles.select}
                value={preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                >
                <option value="DDMMYYYY">DD/MM/YYYY (European)</option>
                <option value="MMDDYYYY">MM/DD/YYYY (American)</option>
                </select>
            </div>
            </div>
        </div>

        {/* Currency */}
        <div className={styles.settingRow}>
            <div className={styles.checkboxWrapper}></div>
            <div className={styles.settingInfo}>
            <label htmlFor="currency" className={styles.settingLabel}>
                Currency
            </label>
            <p className={styles.settingDesc}>
                Select your preferred currency for pricing and reports
            </p>
            </div>
            <div className={styles.settingControl}>
            <div className={styles.selectWrapper}>
                <select
                id="currency"
                className={styles.select}
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="DZD">DZD (دج)</option>
                </select>
            </div>
            </div>
        </div>
        </div>
    </section>

    {/* Forecasting & Alerts */}
    <section className={styles.section}>
        <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Forecasting & Alerts</h2>
        <div className={styles.divider}></div>
        </div>

        <div className={styles.settingsList}>
        {/* Understock */}
        <div className={styles.settingRow}>
            <div className={styles.checkboxWrapper}>
            <input
                type="checkbox"
                id="alert-understock"
                className={styles.checkbox}
                checked={alerts.understock}
                onChange={(e) => handleAlertChange('understock', e.target.checked)}
            />
            </div>
            <div className={styles.settingInfo}>
            <label htmlFor="alert-understock" className={styles.settingLabel}>
                Understock alerts
            </label>
            <p className={styles.settingDesc}>
                Notify when inventory falls below minimum levels
            </p>
            </div>
            <div className={styles.settingControl}></div>
        </div>

        {/* Overstock */}
        <div className={styles.settingRow}>
            <div className={styles.checkboxWrapper}>
            <input
                type="checkbox"
                id="alert-overstock"
                className={styles.checkbox}
                checked={alerts.overstock}
                onChange={(e) => handleAlertChange('overstock', e.target.checked)}
            />
            </div>
            <div className={styles.settingInfo}>
            <label htmlFor="alert-overstock" className={styles.settingLabel}>
                Overstock alerts
            </label>
            <p className={styles.settingDesc}>
                Notify when inventory exceeds maximum capacity
            </p>
            </div>
            <div className={styles.settingControl}></div>
        </div>

        {/* Expiry */}
        <div className={styles.settingRow}>
            <div className={styles.checkboxWrapper}>
            <input
                type="checkbox"
                id="alert-expiry"
                className={styles.checkbox}
                checked={alerts.expiry}
                onChange={(e) => handleAlertChange('expiry', e.target.checked)}
            />
            </div>
            <div className={styles.settingInfo}>
            <label htmlFor="alert-expiry" className={styles.settingLabel}>
                Expiry alerts
            </label>
            <p className={styles.settingDesc}>
                Notify when products are nearing expiration
            </p>
            </div>
            <div className={styles.settingControl}></div>
        </div>

        {/* Low Stock */}
        <div className={styles.settingRow}>
            <div className={styles.checkboxWrapper}>
            <input
                type="checkbox"
                id="alert-low-stock"
                className={styles.checkbox}
                checked={alerts.lowStock}
                onChange={(e) => handleAlertChange('lowStock', e.target.checked)}
            />
            </div>
            <div className={styles.settingInfo}>
            <label htmlFor="alert-low-stock" className={styles.settingLabel}>
                Low stock warnings
            </label>
            <p className={styles.settingDesc}>
                Warn when stock levels are getting low
            </p>
            </div>
            <div className={styles.settingControl}></div>
        </div>

        {/* Stockout */}
        <div className={styles.settingRow}>
            <div className={styles.checkboxWrapper}>
            <input
                type="checkbox"
                id="alert-stockout"
                className={styles.checkbox}
                checked={alerts.stockout}
                onChange={(e) => handleAlertChange('stockout', e.target.checked)}
            />
            </div>
            <div className={styles.settingInfo}>
            <label htmlFor="alert-stockout" className={styles.settingLabel}>
                Stockout alerts
            </label>
            <p className={styles.settingDesc}>
                Alert when items are completely out of stock
            </p>
            </div>
            <div className={styles.settingControl}></div>
        </div>
        </div>
    </section>
    </div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 60px 0' }}>
            <Button
                key={'Save Settings'}
                onClick={() => {}}
                variant={'primary'}
            >
                {'Save Settings'}
            </Button>
        </div>

        <NavBar navItems={simpleNavItems} activeItem={activeItem} />
    </div>
  );
}

export default SettingsPage;